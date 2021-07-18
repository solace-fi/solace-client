import { ETHERSCAN_API_KEY } from '../constants'
import { ExplorerscanApi } from '../constants/enums'
import { ContractSources, GasPriceResult } from '../constants/types'
const STRINGIFIED_ETHERSCAN_API_KEY = String(ETHERSCAN_API_KEY)

const getExplorer = (chainId: number) => {
  switch (chainId) {
    case 4:
      return 'rinkeby.etherscan.io'
    case 42:
      return 'kovan.etherscan.io'
    default:
      return 'etherscan.io'
  }
}

const getApiPrefix = (chainId: number) => {
  switch (chainId) {
    case 4:
    case 42:
      return 'api-'
    default:
      return 'api.'
  }
}

export const getExplorerItemUrl = (chainId: number, address: string, api: ExplorerscanApi): string => {
  return `https://${getExplorer(chainId)}/${api}/${address}`
}

export async function fetchExplorerTxHistoryByAddress(
  chainId: number,
  address: string,
  contractSources: ContractSources[]
): Promise<any> {
  return fetch(
    `https://${getApiPrefix(chainId)}${getExplorer(
      chainId
    )}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=latest&page=1&offset=4500&sort=desc&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
  )
    .then((result) => result.json())
    .then((result) => result.result)
    .then((result) => {
      const contractAddrs = contractSources.map((contract) => {
        return contract.addr
      })
      const filteredResult =
        result !== 'Max rate limit reached' ? result.filter((tx: any) => contractAddrs.includes(tx.to)) : []
      return {
        txList: filteredResult,
      }
    })
}

export async function fetchGasPrice(chainId: number): Promise<GasPriceResult> {
  return fetch(
    `https://${getApiPrefix(chainId)}${getExplorer(
      chainId
    )}/api?module=gastracker&action=gasoracle&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
  )
    .then((result) => result.json())
    .then((result) => result.result)
    .then((result) => {
      return {
        veryFast: Number(result.FastGasPrice),
        fast: Number(result.ProposeGasPrice),
        average: Math.round((Number(result.ProposeGasPrice) + Number(result.SafeGasPrice)) / 2),
        safeLow: Number(result.SafeGasPrice),
      }
    })
}
