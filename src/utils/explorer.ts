import axios from 'axios'
import { ExplorerscanApi } from '../constants/enums'
import { GasPriceResult, NetworkConfig } from '../constants/types'

export const getExplorerItemUrl = (explorer: string, address: string, api: ExplorerscanApi): string =>
  `${explorer}/${api}/${address}`

export async function fetchGasPrice(activeNetwork: NetworkConfig): Promise<GasPriceResult> {
  const key = activeNetwork.explorer.key ? { apikey: activeNetwork.explorer.key } : {}
  const { data } = await axios.get(`${activeNetwork.explorer.apiUrl}/api`, {
    params: {
      module: 'gastracker',
      action: 'gasoracle',
      ...key,
    },
  })
  const result = data.result
  const fetchedResult: GasPriceResult = {
    fast: Number(result.FastGasPrice),
    proposed: Number(result.ProposeGasPrice),
    safe: Number(result.SafeGasPrice),
  }
  if (activeNetwork.chainId == 1) fetchedResult.suggestBaseFee = Number(result.suggestBaseFee)
  return fetchedResult
}

export async function fetchExplorerTxHistoryByAddress(activeNetwork: NetworkConfig, address: string): Promise<any> {
  const key = activeNetwork.explorer.key ? { apikey: activeNetwork.explorer.key } : {}
  const { data } = await axios.get(`${activeNetwork.explorer.apiUrl}/api`, {
    params: {
      module: 'account',
      action: 'txlist',
      address,
      startblock: '0',
      endblock: 'latest',
      page: '1',
      offset: '4500',
      sort: 'desc',
      ...key,
    },
  })
  return data
}

export async function fetchTransferEventsOfUser(activeNetwork: NetworkConfig, user: string): Promise<any> {
  const key = activeNetwork.explorer.key ? { apikey: activeNetwork.explorer.key } : {}
  const { data } = await axios.get(`${activeNetwork.explorer.apiUrl}/api`, {
    params: {
      module: 'account',
      action: 'tokentx',
      address: `${user}`,
      startblock: '0',
      endblock: 'latest',
      ...key,
    },
  })
  const result = data.result
  if (result != 'Max rate limit reached') return result
  return []
}
