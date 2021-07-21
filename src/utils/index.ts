import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'ethers'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// account is not optional
function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  // If there is an account, use Web3Provider and its signer, else use alchemy provider
  const contract = new Contract(address, ABI, getProviderOrSigner(library, account) as any)
  return contract
}

export function getNetworkName(chainId: number | undefined): string {
  switch (chainId) {
    case 1:
      return 'mainnet'
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
    case 5:
      return 'goerli'
    case 42:
      return 'kovan'
    default:
      return '-'
  }
}

const MIN_RETRY_DELAY = 1000
const RETRY_BACKOFF_FACTOR = 2
const MAX_RETRY_DELAY = 10000

export const withBackoffRetries = async (f: any, retryCount = 3, jitter = 250) => {
  let nextWaitTime = MIN_RETRY_DELAY
  let i = 0
  while (true) {
    try {
      return await f()
    } catch (error) {
      i++
      if (i >= retryCount) {
        throw error
      }
      await delay(nextWaitTime + Math.floor(Math.random() * jitter))
      nextWaitTime =
        nextWaitTime === 0 ? MIN_RETRY_DELAY : Math.min(MAX_RETRY_DELAY, RETRY_BACKOFF_FACTOR * nextWaitTime)
    }
  }
}

export const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const rangeFrom1 = (stop: number): number[] => {
  const arr = []
  for (let i = 1; i <= stop; ++i) {
    arr.push(i)
  }
  return arr
}

export const rangeFrom0 = (stop: number): number[] => {
  const arr = []
  for (let i = 0; i < stop; ++i) {
    arr.push(i)
  }
  return arr
}

export const equalsIgnoreCase = (baseString: string, compareString: string): boolean => {
  return baseString.toUpperCase() === compareString.toUpperCase()
}

export const numberify = (number: any): number => {
  if (typeof number == 'number') return number
  if (typeof number == 'string') return parseFloat(number)
  return number.toNumber() // hopefully bignumber
}

export const decimals = (d: number): string => {
  let s = '1'
  for (let i = 0; i < d; ++i) {
    s = `${s}0`
  }
  return s
}

export const bnCmp = (x: BigNumber, y: BigNumber): number => {
  return x.eq(y) ? 0 : x.lt(y) ? 1 : -1
}

export const hasApproval = (tokenAllowance?: string, amountToApprove?: string): boolean => {
  if (!amountToApprove || !tokenAllowance) return false
  const currentAllowance = BigNumber.from(tokenAllowance)
  const currentAmountToApprove = BigNumber.from(amountToApprove)
  if (currentAllowance.gte(currentAmountToApprove)) {
    return true
  }
  return false
}
