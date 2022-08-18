import axios from 'axios'
import { withBackoffRetries } from './time'
import { equalsIgnoreCase } from '.'

export const get1InchPrice = async (fromAddress: string, toAddress: string, amount: string): Promise<any> => {
  if (!equalsIgnoreCase(fromAddress, toAddress)) {
    return await withBackoffRetries(async () =>
      axios.get(
        `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${fromAddress}&toTokenAddress=${toAddress}&amount=${amount}`
      )
    )
  } else {
    return {
      res: {
        data: {
          toTokenAmount: amount,
        },
      },
    }
  }
}

const fetchCoingeckoTokenPrice = (fetchFunction: any) => async (contract: string, quote: string, platform: string) => {
  try {
    const addr = contract.toLowerCase()
    const quoteId = quote.toLowerCase()
    const platformId = platform.toLowerCase()
    const url = `https://api.coingecko.com/api/v3/simple/token_price/${platformId}?contract_addresses=${contract}&vs_currencies=${quoteId}`
    const data = await withBackoffRetries(async () =>
      fetchFunction(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
    const result = await data.json()
    const price = result[addr][quoteId]
    return price ? price + '' : undefined
  } catch (_) {
    console.log(`fetchCoingeckoTokenPrice, cannot fetch for ${contract}`, _)
    return undefined
  }
}

export const getCoingeckoTokenPriceByAddr = fetchCoingeckoTokenPrice(typeof window !== 'undefined' && window.fetch)
