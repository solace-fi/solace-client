import { ethers } from 'ethers'
import { ContractSources } from '../constants/types'

const getInterface = (toAddress: string, contractSources: ContractSources[]): ethers.utils.Interface | undefined => {
  const matchingContract = contractSources.find((contract) => contract.addr.toLowerCase() == toAddress)
  if (!matchingContract) return undefined
  return new ethers.utils.Interface(matchingContract.abi)
}

export const decodeInput = (
  tx: any,
  contractSources: ContractSources[]
): ethers.utils.TransactionDescription | null => {
  // sometimes transactions are not decoded correctly
  try {
    const inter = getInterface(tx.to, contractSources)
    if (!inter) return null
    const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value })
    return decodedInput
  } catch (err) {
    console.log('decodeInput', err)
    return null
  }
}
