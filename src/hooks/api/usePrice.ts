import { useEffect, useRef, useState } from 'react'
import { Token, Pair } from '@sushiswap/sdk'

import { floatUnits } from '../../utils/formatting'
import { queryDecimals } from '../../utils/contract'
import { Contract } from '@ethersproject/contracts'
import { USDC_TOKEN, WETH9_TOKEN } from '../../constants/mappings/token'
import { ZERO } from '../../constants'
import ierc20Json from '../../constants/metadata/IERC20Metadata.json'
import { getCoingeckoTokenPriceByAddr } from '../../utils/api'
import { withBackoffRetries } from '../../utils/time'
import sushiswapLpAbi from '../../constants/metadata/ISushiswapMetadataAlt.json'
import { Unit } from '../../constants/enums'
import { NetworkConfig, TokenToPriceMapping } from '../../constants/types'
import { BigNumber } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Price as PriceApi } from '@solace-fi/sdk-nightly'

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
      return WETH9_TOKEN.address[activeNetwork.chainId]
    return address
  }

  // token to USDC price
  const getPriceFromSushiswap = async (
    token: Contract,
    activeNetwork: NetworkConfig,
    _provider?: any
  ): Promise<number> => {
    if (
      token.address.toLowerCase() == USDC_TOKEN.address[activeNetwork.chainId].toLowerCase() ??
      USDC_TOKEN.address[1].toLowerCase()
    )
      return 1
    try {
      const provider = _provider ?? new JsonRpcProvider(activeNetwork.rpc.httpsUrl)
      const decimals = await queryDecimals(token)
      const TOKEN = new Token(activeNetwork.chainId, handleAddressException(token.address, activeNetwork), decimals)
      const USDC = new Token(
        activeNetwork.chainId,
        USDC_TOKEN.address[activeNetwork.chainId] ?? USDC_TOKEN.address[1],
        6
      )
      const pairAddr = await withBackoffRetries(async () => Pair.getAddress(TOKEN, USDC))
      const pairPoolContract = new Contract(pairAddr, sushiswapLpAbi, provider)
      const reserves = await withBackoffRetries(async () => pairPoolContract.getReserves())
      const tokens = await Promise.all([
        withBackoffRetries(async () => pairPoolContract.token0()),
        withBackoffRetries(async () => pairPoolContract.token1()),
      ])
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
      const coinGeckoTokenPrice = await withBackoffRetries(async () =>
        getCoingeckoTokenPriceByAddr(token.address, 'usd', coingeckoTokenId(activeNetwork.nativeCurrency.symbol))
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
      const [token0, token1] = await Promise.all([
        withBackoffRetries(async () => lpToken.token0()),
        withBackoffRetries(async () => lpToken.token1()),
      ])
      const token0Contract = new Contract(token0, ierc20Json.abi, provider)
      const token1Contract = new Contract(token1, ierc20Json.abi, provider)

      const [decimals0, decimals1, totalSupply, principalDecimals] = await Promise.all([
        queryDecimals(token0Contract),
        queryDecimals(token1Contract),
        withBackoffRetries(async () => lpToken.totalSupply()),
        queryDecimals(lpToken),
      ])

      const portion = balance ? floatUnits(balance, principalDecimals) : 1
      const poolShare = totalSupply.gt(ZERO) ? portion / floatUnits(totalSupply, principalDecimals) : 0
      const price0 = await getPriceFromSushiswap(token0Contract, activeNetwork, provider)
      const price1 = await getPriceFromSushiswap(token1Contract, activeNetwork, provider)

      const TOKEN0 = new Token(activeNetwork.chainId, token0, decimals0)
      const TOKEN1 = new Token(activeNetwork.chainId, token1, decimals1)
      const pairAddr = await withBackoffRetries(async () => Pair.getAddress(TOKEN0, TOKEN1))
      const pairPoolContract = new Contract(pairAddr, sushiswapLpAbi, provider)
      const reserves = await withBackoffRetries(async () => pairPoolContract.getReserves())
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

export const useGetCrossTokenPricesFromCoingecko = (minute: number): { tokenPriceMapping: TokenToPriceMapping } => {
  const [tokenPriceMapping, setTokenPriceMapping] = useState<TokenToPriceMapping>({})
  const gettingPrices = useRef(false)

  useEffect(() => {
    const getPrices = async () => {
      if (gettingPrices.current) return
      gettingPrices.current = true
      const price = new PriceApi()
      const consolidatedPriceMapping = await price.getCoinGeckoTokenPrices()

      setTokenPriceMapping(consolidatedPriceMapping)
      gettingPrices.current = false
    }
    getPrices()
  }, [minute])

  return { tokenPriceMapping }
}
