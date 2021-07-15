import { ethers } from 'ethers'

const getInterface = (toAddress: string, contractArray: { addr: string; abi: any }[]) => {
  const matchingContract = contractArray.find((contract) => contract.addr.toLowerCase() == toAddress)
  return new ethers.utils.Interface(matchingContract?.abi)
}

export const decodeInput = (tx: any, chainId: number, contractArray: { addr: string; abi: any }[]) => {
  const inter = getInterface(tx.to, contractArray)
  const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value })
  const function_name = decodedInput.name.charAt(0).toUpperCase() + decodedInput.name.slice(1)
  return {
    function_name,
  }
}
