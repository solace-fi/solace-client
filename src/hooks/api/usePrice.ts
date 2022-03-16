import { useEffect, useRef, useState } from 'react'
import { Token, Pair } from '@sushiswap/sdk'

import { useNetwork } from '../../context/NetworkManager'
import { floatUnits } from '../../utils/formatting'
import { queryDecimals } from '../../utils/contract'
import { Contract } from '@ethersproject/contracts'
import { USDC_ADDRESS, WETH9_ADDRESS } from '../../constants/mappings/tokenAddressMapping'
import { ZERO } from '../../constants'
import ierc20Json from '../../constants/metadata/IERC20Metadata.json'
import {
  fetchCoingeckoTokenPriceById,
  fetchCoingeckoTokenPricesByAddr,
  getCoingeckoTokenPriceByAddr,
} from '../../utils/api'
import { withBackoffRetries } from '../../utils/time'
import sushiswapLpAbi from '../../constants/metadata/ISushiswapMetadataAlt.json'
import { Unit } from '../../constants/enums'
import { NetworkConfig, TokenToPriceMapping } from '../../constants/types'
import { useProvider } from '../../context/ProviderManager'
import { BigNumber } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'

export const usePriceSdk = () => {
  const { getPriceFromSushiswap, getPriceFromSushiswapLp } = useGetPriceFromSushiSwap()
  const getPriceSdkFunc = (sdkStr?: string) => {
    switch (sdkStr) {
      case 'sushi':
      default:
        return { getSdkTokenPrice: getPriceFromSushiswap, getSdkLpPrice: getPriceFromSushiswapLp }
    }
  }

  return { getPriceSdkFunc }
}

export const useGetPriceFromSushiSwap = () => {
  const coingeckoTokenId = (unit: Unit) => {
    switch (unit) {
      case Unit.ETH:
        return 'ethereum'
      case Unit.MATIC:
      default:
        return 'matic-network'
    }
  }

  const handleAddressException = (address: string, activeNetwork: NetworkConfig) => {
    if (address.toLowerCase() == activeNetwork.config.keyContracts['vault'].addr.toLowerCase())
      return WETH9_ADDRESS[activeNetwork.chainId]
    return address
  }

  // token to USDC price
  const getPriceFromSushiswap = async (
    token: Contract,
    activeNetwork: NetworkConfig,
    _provider?: any
  ): Promise<number> => {
    if (
      token.address.toLowerCase() == USDC_ADDRESS[activeNetwork.chainId].toLowerCase() ??
      USDC_ADDRESS[1].toLowerCase()
    )
      return 1
    try {
      const provider = _provider ?? new JsonRpcProvider(activeNetwork.rpc.httpsUrl)
      const decimals = await queryDecimals(token)
      const TOKEN = new Token(activeNetwork.chainId, handleAddressException(token.address, activeNetwork), decimals)
      const USDC = new Token(activeNetwork.chainId, USDC_ADDRESS[activeNetwork.chainId] ?? USDC_ADDRESS[1], 6)
      const pairAddr = await Pair.getAddress(TOKEN, USDC)
      const pairPoolContract = new Contract(pairAddr, sushiswapLpAbi, provider)
      const reserves = await pairPoolContract.getReserves()
      const tokens = await Promise.all([pairPoolContract.token0(), pairPoolContract.token1()])
      if (tokens[0].toLowerCase() == token.address.toLowerCase()) {
        const token0ReadableAmount = floatUnits(reserves._reserve0, decimals)
        const token1ReadableAmount = floatUnits(reserves._reserve1, 6)
        if (token0ReadableAmount == 0 || token1ReadableAmount == 0) return 0
        return token1ReadableAmount / token0ReadableAmount
      } else {
        const token0ReadableAmount = floatUnits(reserves._reserve0, 6)
        const token1ReadableAmount = floatUnits(reserves._reserve1, decimals)
        if (token0ReadableAmount == 0 || token1ReadableAmount == 0) return 0
        return token0ReadableAmount / token1ReadableAmount
      }
    } catch (err) {
      console.log(`getPriceFromSushiswap, cannot retrieve for ${token.address}`, err)
      const coinGeckoTokenPrice = await getCoingeckoTokenPriceByAddr(
        token.address,
        'usd',
        coingeckoTokenId(activeNetwork.nativeCurrency.symbol)
      )
      return parseFloat(coinGeckoTokenPrice ?? '0')
    }
  }

  // lp token to USDC price
  const getPriceFromSushiswapLp = async (
    lpToken: Contract,
    activeNetwork: NetworkConfig,
    _provider?: any,
    balance?: BigNumber
  ): Promise<number> => {
    try {
      const provider = _provider ?? new JsonRpcProvider(activeNetwork.rpc.httpsUrl)
      const [token0, token1] = await Promise.all([lpToken.token0(), lpToken.token1()])
      const token0Contract = new Contract(token0, ierc20Json.abi, provider)
      const token1Contract = new Contract(token1, ierc20Json.abi, provider)

      const [decimals0, decimals1, totalSupply, principalDecimals] = await Promise.all([
        withBackoffRetries(async () => queryDecimals(token0Contract)),
        withBackoffRetries(async () => queryDecimals(token1Contract)),
        lpToken.totalSupply(),
        queryDecimals(lpToken),
      ])

      const portion = balance ? floatUnits(balance, principalDecimals) : 1
      const poolShare = totalSupply.gt(ZERO) ? portion / floatUnits(totalSupply, principalDecimals) : 0
      const price0 = await getPriceFromSushiswap(token0Contract, activeNetwork, provider)
      const price1 = await getPriceFromSushiswap(token1Contract, activeNetwork, provider)

      const TOKEN0 = new Token(activeNetwork.chainId, token0, decimals0)
      const TOKEN1 = new Token(activeNetwork.chainId, token1, decimals1)
      const pairAddr = await Pair.getAddress(TOKEN0, TOKEN1)
      const pairPoolContract = new Contract(pairAddr, sushiswapLpAbi, provider)
      const reserves = await pairPoolContract.getReserves()
      const totalReserve0 = floatUnits(reserves._reserve0, decimals0)
      const totalReserve1 = floatUnits(reserves._reserve1, decimals1)
      const multiplied = poolShare * (price0 * totalReserve0 + price1 * totalReserve1)
      return multiplied
    } catch (err) {
      console.log(`getPriceFromSushiswapLp, cannot retrieve for ${lpToken.address}`, err)
      return 0
    }
  }

  return { getPriceFromSushiswap, getPriceFromSushiswapLp }
}

export const useGetCrossTokenPricesFromCoingecko = () => {
  const [tokenPriceMapping, setPriceMapping] = useState<TokenToPriceMapping>({})
  const gettingPrices = useRef(false)
  const { networks } = useNetwork()
  const { latestBlock } = useProvider()

  const getPricesByAddress = async (addrs: string[]): Promise<TokenToPriceMapping> => {
    const uniqueAddrs = addrs.filter((v, i, a) => a.indexOf(v) === i)
    const prices = await fetchCoingeckoTokenPricesByAddr(uniqueAddrs, 'usd', 'ethereum')
    const array: { addr: string; price: number }[] = []
    uniqueAddrs.forEach((uniqueAddr) => {
      if (!prices[uniqueAddr.toLowerCase()]) {
        array.push({ addr: uniqueAddr.toLowerCase(), price: 0 })
      } else {
        array.push({ addr: uniqueAddr.toLowerCase(), price: prices[uniqueAddr.toLowerCase()].usd })
      }
    })
    const hashmap: TokenToPriceMapping = array.reduce(
      (prices: any, data: { addr: string; price: number }) => ({
        ...prices,
        [data.addr.toLowerCase()]: data.price,
      }),
      {}
    )
    return hashmap
  }

  const getPricesById = async (ids: string[]) => {
    const uniqueIds = ids.filter((v, i, a) => a.indexOf(v) === i)
    const prices = await fetchCoingeckoTokenPriceById(uniqueIds, 'usd')
    const array: { id: string; price: number }[] = []
    uniqueIds.forEach((uniqueId) => {
      if (!prices.find((p: any) => (p.id = uniqueId.toLowerCase()))) {
        array.push({ id: uniqueId.toLowerCase(), price: 0 })
      } else {
        array.push({
          id: uniqueId.toLowerCase(),
          price: prices.find((p: any) => (p.id = uniqueId.toLowerCase())).current_price,
        })
      }
    })
    const hashmap: TokenToPriceMapping = array.reduce(
      (prices: any, data: { id: string; price: number }) => ({
        ...prices,
        [data.id.toLowerCase()]: data.price,
      }),
      {}
    )
    return hashmap
  }

  useEffect(() => {
    const getPrices = async () => {
      if (gettingPrices.current) return
      gettingPrices.current = true
      const solaceAddr = networks[0].config.keyContracts.solace.addr

      const nativeAddrs = networks.map((n) => n.nativeCurrency.mainnetReference)
      const tokenAddrs: string[] = []
      const tokenids: string[] = []

      for (let i = 0; i < networks.length; i++) {
        const n = networks[i]
        Object.keys(n.cache.tellerToTokenMapping).forEach((teller) => {
          const tellerToTokenMapping = n.cache.tellerToTokenMapping
          const addr = tellerToTokenMapping[teller].mainnetAddr
          if (addr != '') {
            tokenAddrs.push(addr)
          } else {
            tokenids.push(tellerToTokenMapping[teller].tokenId)
          }
        })
      }

      const mainnetAddrs = [...nativeAddrs, ...tokenAddrs]
      mainnetAddrs.push(solaceAddr)

      const priceMapByAddress = mainnetAddrs.length > 0 ? await getPricesByAddress(mainnetAddrs) : {}
      const priceMapById = tokenids.length > 0 ? await getPricesById(tokenids) : {}
      const consolidatedPriceMapping = { ...priceMapByAddress, ...priceMapById }
      setPriceMapping(consolidatedPriceMapping)
      gettingPrices.current = false
    }
    getPrices()
  }, [latestBlock])

  return { tokenPriceMapping }
}
