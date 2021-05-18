import { useEffect, useState } from 'react'
import { ChainId, Fetcher, Route, WETH, Trade, TokenAmount, TradeType } from '@uniswap/sdk'
import { useWallet } from '../context/WalletManager'

const chainId = ChainId.RINKEBY
const tokenAddress = '0x44B843794416911630e74bAB05021458122c40A0' // rinkeby tokenaddress of SOLACE

export function usePairPrice(): any {
  const [pairPrice, setPairPrice] = useState<any>('0.01')
  const { library } = useWallet()

  useEffect(() => {
    const getPairPrice = async () => {
      const solace = await Fetcher.fetchTokenData(chainId, tokenAddress)
      const weth = WETH[chainId]
      try {
        const pair = await Fetcher.fetchPairData(solace, weth, library)
        const route = new Route([pair], weth)
        const trade = new Trade(route, new TokenAmount(weth, '1000000000000000'), TradeType.EXACT_INPUT)
        console.log('trade', trade)
        const pairPrice = trade.executionPrice.toSignificant(6)
        setPairPrice(pairPrice)
      } catch (err) {
        console.log('getPairPrice', err)
      }
    }
    getPairPrice()
  }, [library])

  return pairPrice
}
