import { useEffect, useMemo, useRef, useState } from 'react'
import { Token, Pair } from '@sushiswap/sdk'

import { useNetwork } from '../context/NetworkManager'
import { floatUnits } from '../utils/formatting'
import { queryDecimals } from '../utils/contract'
import { Contract } from '@ethersproject/contracts'
import { getContract } from '../utils'
import sushiSwapLpAltABI from '../constants/metadata/ISushiswapMetadataAlt.json'
import { useWallet } from '../context/WalletManager'
import { USDC_ADDRESS, WETH9_ADDRESS } from '../constants/mappings/tokenAddressMapping'
import { ZERO } from '../constants'
import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import { fetchCoingeckoTokenPrices, getCoingeckoTokenPrice } from '../utils/api'
import { withBackoffRetries } from '../utils/time'
import sushiswapLpAbi from '../constants/metadata/ISushiswapMetadataAlt.json'
import { Unit } from '../constants/enums'
import { TokenToPriceMapping } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { useProvider } from '../context/ProviderManager'

export const useGetPriceFromSushiSwap = () => {
  const { library } = useWallet()
  const { activeNetwork, chainId } = useNetwork()
  const coingeckoTokenId = useMemo(() => {
    switch (activeNetwork.nativeCurrency.symbol) {
      case Unit.ETH:
        return 'ethereum'
      case Unit.MATIC:
      default:
        return 'matic-network'
    }
  }, [activeNetwork.nativeCurrency.symbol])

  const handleAddressException = (address: string) => {
    if (address.toLowerCase() == activeNetwork.config.keyContracts['vault'].addr.toLowerCase())
      return WETH9_ADDRESS[chainId]
    return address
  }

  // token to USDC price
  const getPriceFromSushiswap = async (token: Contract): Promise<number> => {
    if (!library) return -1
    if (token.address.toLowerCase() == USDC_ADDRESS[chainId].toLowerCase() ?? USDC_ADDRESS[1].toLowerCase()) return 1
    try {
      const decimals = await queryDecimals(token)
      const TOKEN = new Token(chainId, handleAddressException(token.address), decimals)
      const USDC = new Token(chainId, USDC_ADDRESS[chainId] ?? USDC_ADDRESS[1], 6)
      const pairAddr = await Pair.getAddress(TOKEN, USDC)
      const pairPoolContract = getContract(pairAddr, sushiSwapLpAltABI, library)
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
      return -1
    }
  }

  // lp token to USDC price
  const getPriceFromSushiswapLp = async (lpToken: Contract): Promise<number> => {
    if (!library) return -1
    try {
      const [token0, token1] = await Promise.all([lpToken.token0(), lpToken.token1()])
      const token0Contract = getContract(token0, ierc20Json.abi, library)
      const token1Contract = getContract(token1, ierc20Json.abi, library)

      const [decimals0, decimals1, totalSupply, principalDecimals] = await Promise.all([
        withBackoffRetries(async () => queryDecimals(token0Contract)),
        withBackoffRetries(async () => queryDecimals(token1Contract)),
        lpToken.totalSupply(),
        queryDecimals(lpToken),
      ])

      const poolShareOfOneUnit = totalSupply.gt(ZERO) ? 1 / floatUnits(totalSupply, principalDecimals) : 0
      let price0 = await getPriceFromSushiswap(token0Contract)
      let price1 = await getPriceFromSushiswap(token1Contract)

      if (price0 == -1) {
        const coinGeckoTokenPrice = await getCoingeckoTokenPrice(token0Contract.address, 'usd', coingeckoTokenId)
        price0 = parseFloat(coinGeckoTokenPrice ?? '0')
      }
      if (price1 == -1) {
        const coinGeckoTokenPrice = await getCoingeckoTokenPrice(token1Contract.address, 'usd', coingeckoTokenId)
        price1 = parseFloat(coinGeckoTokenPrice ?? '0')
      }

      const TOKEN0 = new Token(chainId, token0, decimals0)
      const TOKEN1 = new Token(chainId, token1, decimals1)
      const pairAddr = await Pair.getAddress(TOKEN0, TOKEN1)
      const pairPoolContract = getContract(pairAddr, sushiswapLpAbi, library)
      const reserves = await pairPoolContract.getReserves()
      const totalReserve0 = floatUnits(reserves._reserve0, decimals0)
      const totalReserve1 = floatUnits(reserves._reserve1, decimals1)
      const multiplied = poolShareOfOneUnit * (price0 * totalReserve0 + price1 * totalReserve1)
      return multiplied
    } catch (err) {
      console.log(`getPriceFromSushiswapLp, cannot retrieve for ${lpToken.address}`, err)
      return -1
    }
  }

  return { getPriceFromSushiswap, getPriceFromSushiswapLp }
}

export const useGetPricesFromCoingecko = () => {
  const getPricesFromCoingecko = async (addrs: string[]): Promise<TokenToPriceMapping> => {
    const uniqueAddrs = addrs.filter((v, i, a) => a.indexOf(v) === i)
    const prices = await fetchCoingeckoTokenPrices(uniqueAddrs, 'usd', 'ethereum')
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

  return { getPricesFromCoingecko }
}

export const useGetTokenPricesFromCoingecko = () => {
  const [tokenPriceMapping, setPriceMapping] = useState<TokenToPriceMapping>({})
  const gettingPrices = useRef(false)
  const { tellers } = useContracts()
  const { networks } = useNetwork()
  const { latestBlock } = useProvider()
  const { getPricesFromCoingecko } = useGetPricesFromCoingecko()

  const mappingIsEmpty = () => Object.keys(tokenPriceMapping).length === 0 && tokenPriceMapping.constructor === Object

  useEffect(() => {
    const getPrices = async () => {
      if (!latestBlock || gettingPrices.current) return
      gettingPrices.current = true
      const solaceAddr = networks[0].config.keyContracts.solace.addr
      const mainnetAddrs = tellers.map((t) => t.mainnetAddr)
      mainnetAddrs.push(solaceAddr)
      const priceMap = await getPricesFromCoingecko(mainnetAddrs)
      setPriceMapping(priceMap)
      gettingPrices.current = false
    }
    getPrices()
  }, [tellers, latestBlock])

  return { tokenPriceMapping, mappingIsEmpty }
}
