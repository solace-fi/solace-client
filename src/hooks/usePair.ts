import { useEffect, useState } from 'react'
import { ChainId, Fetcher, Route, WETH, Trade, TokenAmount, TradeType } from '@uniswap/sdk'
import { POW_EIGHTEEN } from '../constants'
import { contractConfig } from '../config/chainConfig'

export function usePairPrice(): string {
  const [pairPrice, setPairPrice] = useState<string>('-')
  const chainId = ChainId.RINKEBY
  const tokenAddress = String(contractConfig[chainId].keyContracts.solace.addr) // rinkeby tokenaddress of SOLACE

  useEffect(() => {
    const getPairPrice = async () => {
      const solace = await Fetcher.fetchTokenData(chainId, tokenAddress)
      const weth = WETH[chainId]
      try {
        const pair = await Fetcher.fetchPairData(solace, weth)
        const route = new Route([pair], weth)
        const trade = new Trade(route, new TokenAmount(weth, String(POW_EIGHTEEN)), TradeType.EXACT_INPUT)
        const pairPrice = trade.executionPrice.toSignificant(6)
        setPairPrice(pairPrice)
      } catch (err) {
        console.log('getPairPrice', err)
      }
    }
    getPairPrice()
  }, [])

  return pairPrice
}
