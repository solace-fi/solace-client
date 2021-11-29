import { ethers } from 'ethers'
import { ContractSources } from '../constants/types'
import { capitalizeFirstLetter } from './formatting'

const getInterface = (toAddress: string, contractSources: ContractSources[]): ethers.utils.Interface | undefined => {
  const matchingContract = contractSources.find((contract) => contract.addr.toLowerCase() == toAddress)
  if (!matchingContract) return undefined
  return new ethers.utils.Interface(matchingContract.abi)
}

export const decodeInput = (tx: any, contractSources: ContractSources[]): string | null => {
  const inter = getInterface(tx.to, contractSources)
  if (!inter) return null
  const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value })
  const function_name = capitalizeFirstLetter(decodedInput.name)
  return function_name
}
