import { useEffect, useState } from 'react'
import { ChainId, Fetcher, Route, WETH, Trade, TokenAmount, TradeType } from '@uniswap/sdk'
import { SOLACE_CONTRACT_ADDRESS, POW_EIGHTEEN } from '../constants'

const chainId = ChainId.RINKEBY
const tokenAddress = String(SOLACE_CONTRACT_ADDRESS) // rinkeby tokenaddress of SOLACE

export function usePairPrice(): any {
  const [pairPrice, setPairPrice] = useState<any>('0.01')

  useEffect(() => {
    const getPairPrice = async () => {
      const solace = await Fetcher.fetchTokenData(chainId, tokenAddress)
      const weth = WETH[chainId]
      try {
        const pair = await Fetcher.fetchPairData(solace, weth)
        const route = new Route([pair], weth)
        const trade = new Trade(route, new TokenAmount(weth, String(POW_EIGHTEEN)), TradeType.EXACT_INPUT)
        console.log('trade', trade)
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
