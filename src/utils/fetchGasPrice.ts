import { ETHERSCAN_API_KEY } from '../constants'
const STRINGIFIED_ETHERSCAN_API_KEY = String(ETHERSCAN_API_KEY)

type GasPriceResult = {
  veryFast: number
  fast: number
  average: number
  safeLow: number
}

export async function fetchGasPrice(): Promise<GasPriceResult> {
  return fetch(
    `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${STRINGIFIED_ETHERSCAN_API_KEY}`
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
