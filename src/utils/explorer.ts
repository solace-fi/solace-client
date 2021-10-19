import { ETHERSCAN_API_KEY } from '../constants'
import { ExplorerscanApi } from '../constants/enums'
import { ContractSources, GasPriceResult } from '../constants/types'
import { withBackoffRetries } from './time'

const STRINGIFIED_ETHERSCAN_API_KEY = String(ETHERSCAN_API_KEY)

export const getExplorerItemUrl = (explorer: string, address: string, api: ExplorerscanApi): string => {
  return `${explorer}/${api}/${address}`
}

export async function fetchExplorerTxHistoryByAddress(
  explorer: string,
  address: string,
  contractSources: ContractSources[]
): Promise<any> {
  return fetch(
    `${explorer}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=latest&page=1&offset=4500&sort=desc&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
  )
    .then((result) => result.json())
    .then((result) => {
      return result
    })
}

export async function fetchGasPrice(explorer: string, chainId: number): Promise<GasPriceResult> {
  return await withBackoffRetries(async () =>
    fetch(`${explorer}/api?module=gastracker&action=gasoracle&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`)
  )
    .then((result) => result.json())
    .then((result) => result.result)
    .then((result) => {
      const fetchedResult: GasPriceResult = {
        veryFast: Number(result.FastGasPrice),
        fast: Number(result.ProposeGasPrice),
        average: Math.round((Number(result.ProposeGasPrice) + Number(result.SafeGasPrice)) / 2),
        safeLow: Number(result.SafeGasPrice),
      }
      if (chainId == 1) fetchedResult.suggestBaseFee = Number(result.suggestBaseFee)
      return fetchedResult
    })
}
