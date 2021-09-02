import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'ethers'
import { WalletConnector } from '../wallet'
import { NetworkConfig } from '../constants/types'
import { getGasValue } from './formatting'

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

export const equalsIgnoreCase = (baseString: string, compareString: string): boolean => {
  return baseString.toUpperCase() === compareString.toUpperCase()
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

export const getGasConfig = (
  activeWalletConnector: WalletConnector | undefined,
  activeNetwork: NetworkConfig,
  gasValue: any
): any => {
  if (!activeWalletConnector || !gasValue) return {}
  if (activeWalletConnector.supportedTxTypes.includes(2) && activeNetwork.supportedTxTypes.includes(2))
    return {
      maxFeePerGas: getGasValue(gasValue),
      type: 2,
    }
  return {
    gasPrice: getGasValue(gasValue),
  }
}
