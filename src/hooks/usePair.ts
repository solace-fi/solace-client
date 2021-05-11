import { useEffect, useState } from 'react'
import { ChainId, Fetcher, Route, WETH, Trade, TokenAmount, TradeType } from '@uniswap/sdk'

const chainId = ChainId.RINKEBY
const tokenAddress = '0x44B843794416911630e74bAB05021458122c40A0' // rinkeby tokenaddress of SOLACE

export function usePairPrice(): any {
  const [pairPrice, setPairPrice] = useState<any>('-')

  useEffect(() => {
    const getPairPrice = async () => {
      try {
        // Fetch Token Data according to TokenAddress taken from etherscan
        const solace = await Fetcher.fetchTokenData(chainId, tokenAddress)

        // Fetch Trading Token Data ' Wrapped Ether '
        const weth = WETH[chainId]

        // Fetch theoretical pair data with solace and weth
        const pair = await Fetcher.fetchPairData(solace, weth)
        const route = new Route([pair], weth)

        // Fetch theoretical prices when trading 1 wETH to SOLACE
        const trade = new Trade(route, new TokenAmount(weth, '1000000000000000'), TradeType.EXACT_INPUT)
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
