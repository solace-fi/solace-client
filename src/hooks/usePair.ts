import { useEffect, useState } from 'react'
import { Token, Pair } from '@sushiswap/sdk'

import { useNetwork } from '../context/NetworkManager'
import { floatUnits, truncateBalance } from '../utils/formatting'
import { queryDecimals } from '../utils/contract'
import { Contract } from '@ethersproject/contracts'
import { getContract } from '../utils'
import sushiSwapLpAltABI from '../constants/metadata/ISushiswapMetadataAlt.json'
import { useWallet } from '../context/WalletManager'
import { USDC_ADDRESS, WETH9_ADDRESS } from '../constants/mappings/tokenAddressMapping'
import { useProvider } from '../context/ProviderManager'

export function usePairPrice(token: Contract | null | undefined) {
  const [pairPrice, setPairPrice] = useState<string>('-')
  const { library } = useWallet()
  const { chainId } = useNetwork()
  const { latestBlock } = useProvider()
  const getPairPrice = useGetPairPrice()

  useEffect(() => {
    if (!token || !latestBlock) return
    const start = async () => {
      const price = await getPairPrice(token)
      if (price > 0) {
        setPairPrice(truncateBalance(price, 2))
      }
    }
    start()
  }, [token, chainId, library, latestBlock])

  return { pairPrice }
}

export const useGetPairPrice = () => {
  const { library } = useWallet()
  const { activeNetwork, chainId } = useNetwork()

  const handleAddressException = (address: string) => {
    if (address.toLowerCase() == activeNetwork.config.keyContracts['vault'].addr.toLowerCase())
      return WETH9_ADDRESS[chainId]
    return address
  }

  const getPairPrice = async (token: Contract): Promise<number> => {
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
      console.log(`getPairPrice, cannot retrieve for ${token.address}`, err)
      return -1
    }
  }

  return getPairPrice
}
