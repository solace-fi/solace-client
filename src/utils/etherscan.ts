import { ETHERSCAN_API_KEY } from '../constants'
const STRINGIFIED_ETHERSCAN_API_KEY = String(ETHERSCAN_API_KEY)

type GasPriceResult = {
  veryFast: number
  fast: number
  average: number
  safeLow: number
}

const getWebPrefix = (chainId: number) => {
  switch (chainId) {
    case 4:
      return 'rinkeby.'
    case 42:
      return 'kovan.'
    default:
      return ''
  }
}

const getApiPrefix = (chainId: number) => {
  switch (chainId) {
    case 4:
      return '-rinkeby'
    case 42:
      return '-kovan'
    default:
      return ''
  }
}

export function getEtherscanTxUrl(txHash?: string, chainId = 1): string | undefined {
  if (txHash) {
    const webPrefix = getWebPrefix(chainId)
    return `https://${webPrefix}etherscan.io/tx/${txHash}`
  }

  return undefined
}

export function getEtherscanAddressUrl(address?: string, chainId = 1): string | undefined {
  if (address) {
    const webPrefix = getWebPrefix(chainId)
    return `https://${webPrefix}etherscan.io/address/${address}`
  }

  return undefined
}

export function getEtherscanABIUrl(address?: string, apiKey?: string, chainId = 1): string | undefined {
  if (address) {
    const apiPrefix = getApiPrefix(chainId)
    return `https://api${apiPrefix}.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`
  }

  return undefined
}

export async function fetchGasPrice(chainId: number): Promise<GasPriceResult> {
  const apiPrefix = getApiPrefix(chainId)
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
