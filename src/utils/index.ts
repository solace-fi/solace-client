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
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
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

  if (ABI == null || ABI == undefined) {
    throw Error(`ABI parameter invalid: ${ABI}`)
  }

  // If there is an account, use Web3Provider and its signer, else use alchemy provider
  const contract = new Contract(address, ABI, getProviderOrSigner(library, account) as any)
  return contract
}

export const equalsIgnoreCase = (baseString: string, compareString: string): boolean => {
  return baseString.toUpperCase() === compareString.toUpperCase()
}

export const hasApproval = (tokenAllowance: string, amountToApprove: string): boolean => {
  const currentAllowance = BigNumber.from(tokenAllowance)
  if (currentAllowance.isZero()) return false
  const currentAmountToApprove = BigNumber.from(amountToApprove)
  if (currentAllowance.gte(currentAmountToApprove)) {
    return true
  }
  return false
}

export const validateTokenArrays = (arrayA: string[], arrayB: string[]): boolean => {
  return arrayA.length === arrayB.length && arrayA.every((value) => arrayB.includes(value))
}
