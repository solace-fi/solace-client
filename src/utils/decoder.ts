import { ethers } from 'ethers'
import { ContractSources } from '../constants/types'

const getInterface = (toAddress: string, contractSources: ContractSources[]) => {
  const matchingContract = contractSources.find((contract) => contract.addr.toLowerCase() == toAddress)
  return new ethers.utils.Interface(matchingContract?.abi)
}

export const decodeInput = (tx: any, chainId: number, contractSources: ContractSources[]) => {
  const inter = getInterface(tx.to, contractSources)
  const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value })
  const function_name = decodedInput.name.charAt(0).toUpperCase() + decodedInput.name.slice(1)
  return {
    function_name,
  }
}
