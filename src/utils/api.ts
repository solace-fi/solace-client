import { ClaimAssessment, SolaceRiskBalance, SolaceRiskScore } from '../constants/types'
import axios from 'axios'
import { withBackoffRetries } from './time'
import { equalsIgnoreCase } from '.'

export async function getClaimAssessment(policyId: string, chainId: number): Promise<ClaimAssessment> {
  const { data } = await axios.get(`https://paclas.solace.fi/claims/assess`, {
    params: { chainid: chainId, policyid: policyId },
  })
  return data
}

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

export const fetchCoingeckoTokenPricesByAddr = async (contractAddrs: string[], quote: string, platform: string) => {
  let contractsStr = ''
  for (let i = 0; i < contractAddrs.length; i++) {
    contractsStr += contractAddrs[i]
    if (i < contractAddrs.length - 1) {
      contractsStr += ','
    }
  }
  const quoteId = quote.toLowerCase()
  const platformId = platform.toLowerCase()
  const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${platformId}`, {
    params: {
      contract_addresses: contractsStr,
      vs_currencies: quoteId,
    },
  })
  return data
}

export const fetchCoingeckoTokenPriceById = async (ids: string[], quote: string) => {
  let idsStr = ''
  for (let i = 0; i < ids.length; i++) {
    idsStr += ids[i]
    if (i < ids.length - 1) {
      idsStr += ','
    }
  }
  const quoteId = quote.toLowerCase()
  const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
    params: {
      ids: idsStr,
      vs_currency: quoteId,
    },
  })
  return data
}

export const getZapperProtocolBalances = async (appId: string, addresses: string[], network: string) => {
  const { data } = await axios.get(`https://api.zapper.fi/v1/protocols/${appId}/balances`, {
    params: {
      newBalances: true,
      addresses: addresses,
      network: network,
      api_key: String(process.env.REACT_APP_ZAPPER_API_KEY),
    },
  })
  return data
}

export const getSolaceRiskBalances = async (
  address: string,
  chains: number[]
): Promise<SolaceRiskBalance[] | undefined> => {
  return await withBackoffRetries(async () =>
    fetch(`https://risk-data.solace.fi/balances`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chains: chains,
        account: address,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        return data
      })
      .catch((error) => {
        console.error('Error getSolaceRiskBalances:', error)
        return undefined
      })
  )
}

export const getSolaceRiskScores = async (
  address: string,
  positions: SolaceRiskBalance[]
): Promise<SolaceRiskScore | undefined> => {
  return await withBackoffRetries(async () =>
    fetch('https://risk-data.solace.fi/scores', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: address,
        positions: positions,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        return data
      })
      .catch((error) => {
        console.error('Error getSolaceRiskScores:', error)
        return undefined
      })
  )
}
