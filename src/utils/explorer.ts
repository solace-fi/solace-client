import { ETHERSCAN_API_KEY } from '../constants'
import { ExplorerscanApi } from '../constants/enums'
import { /*ContractSources, */ GasPriceResult, NetworkConfig } from '../constants/types'
import { withBackoffRetries } from './time'

const STRINGIFIED_ETHERSCAN_API_KEY = String(ETHERSCAN_API_KEY)

export const getExplorerItemUrl = (explorer: string, address: string, api: ExplorerscanApi): string => {
  return `${explorer}/${api}/${address}`
}

export async function fetchExplorerTxHistoryByAddress(
  explorer: string,
  address: string
  // contractSources: ContractSources[]
): Promise<any> {
  return fetch(
    `${explorer}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=latest&page=1&offset=4500&sort=desc&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
  )
    .then((result) => result.json())
    .then((result) => {
      return result
    })
}

export async function fetchGasPrice(activeNetwork: NetworkConfig): Promise<GasPriceResult> {
  return await withBackoffRetries(async () =>
    fetch(
      `${activeNetwork.explorer.apiUrl}/api?module=gastracker&action=gasoracle&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
    )
  )
    .then((result) => result.json())
    .then((result) => result.result)
    .then((result) => {
      const fetchedResult: GasPriceResult = {
        fast: Number(result.FastGasPrice),
        proposed: Number(result.ProposeGasPrice),
        safe: Number(result.SafeGasPrice),
      }
      if (activeNetwork.chainId == 1) fetchedResult.suggestBaseFee = Number(result.suggestBaseFee)
      return fetchedResult
    })
}

export async function fetchTransferEventsOfUser(explorer: string, user: string): Promise<any> {
  return await withBackoffRetries(async () =>
    fetch(
      `${explorer}/api?module=account&action=tokentx&address=${user}&startblock=0&endblock=latest&apikey=${String(
        ETHERSCAN_API_KEY
      )}`
    )
  )
    .then((res) => res.json())
    .then((result) => result.result)
    .then((result) => {
      if (result != 'Max rate limit reached') return result
      return []
    })
}
