import { ETHERSCAN_API_KEY, CHAIN_ID, CONTRACTS_ARRAY } from '../constants'
const STRINGIFIED_ETHERSCAN_API_KEY = String(ETHERSCAN_API_KEY)

type GasPriceResult = {
  veryFast: number
  fast: number
  average: number
  safeLow: number
}

const getWebPrefix = () => {
  switch (Number(CHAIN_ID)) {
    case 4:
      return 'rinkeby.'
    case 42:
      return 'kovan.'
    default:
      return ''
  }
}

const getApiPrefix = () => {
  switch (Number(CHAIN_ID)) {
    case 4:
      return '-rinkeby'
    case 42:
      return '-kovan'
    default:
      return ''
  }
}

export function getEtherscanTxUrl(txHash?: string): string | undefined {
  if (txHash) {
    const webPrefix = getWebPrefix()
    return `https://${webPrefix}etherscan.io/tx/${txHash}`
  }

  return undefined
}

export function getEtherscanBlockUrl(blockHash: string): string | undefined {
  if (blockHash) {
    const webPrefix = getWebPrefix()
    return `https://${webPrefix}etherscan.io/block/${blockHash}`
  }

  return undefined
}

export function getEtherscanAddressUrl(address?: string): string | undefined {
  if (address) {
    const webPrefix = getWebPrefix()
    return `https://${webPrefix}etherscan.io/address/${address}`
  }

  return undefined
}

export function getEtherscanABIUrl(address?: string, apiKey?: string): string | undefined {
  if (address) {
    const apiPrefix = getApiPrefix()
    return `https://api${apiPrefix}.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`
  }

  return undefined
}

export async function fetchEtherscanLatestBlock(): Promise<any> {
  const apiPrefix = getApiPrefix()
  return fetch(
    `https://api${apiPrefix}.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
  )
    .then((result) => result.json())
    .then((result) => result.result)
    .then((result) => {
      return {
        latestBlockNumber: Number(result),
      }
    })
}

export async function fetchEtherscanTxHistoryByAddress(address: string): Promise<any> {
  const apiPrefix = getApiPrefix()
  const block = await fetchEtherscanLatestBlock()
  return fetch(
    `https://api${apiPrefix}.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=${block.latestBlockNumber}&page=1&offset=40&sort=desc&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
  )
    .then((result) => result.json())
    .then((result) => result.result)
    .then((result) => {
      const filteredResult =
        result !== 'Max rate limit reached'
          ? result.filter((tx: any) => CONTRACTS_ARRAY.includes(tx.to)).slice(0, 30)
          : []
      return {
        txList: filteredResult,
      }
    })
}

export async function fetchGasPrice(): Promise<GasPriceResult> {
  const apiPrefix = getApiPrefix()
  return fetch(
    `https://api${apiPrefix}.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
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
