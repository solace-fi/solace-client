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
): {
  function_name: string | null
} => {
  const inter = getInterface(tx.to, contractSources)
  if (!inter)
    return {
      function_name: null,
    }
  const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value })
  const function_name = decodedInput.name.charAt(0).toUpperCase() + decodedInput.name.slice(1)
  return {
    function_name,
  }
}
