import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { decodeInput } from '../utils/decoder'
import { FunctionNames } from '../constants/enums'
import { formatTransactionContent } from '../utils/formatting'
import { DEFAULT_CHAIN_ID } from '../constants'
import { useContractArray } from './useContract'

export const useTransactionDetails = (txList: any): string[] => {
  const { library, chainId } = useWallet()
  const [amounts, setAmounts] = useState<string[]>([])
  const contractArray = useContractArray()

  const getTransactionAmount = async (
    function_name: string,
    tx: any,
    provider: Web3Provider | Provider
  ): Promise<string> => {
    const receipt = await provider.getTransactionReceipt(tx.hash)
    if (receipt.status == 0) return '0'
    if (!receipt) return '0'
    const logs = receipt.logs
    if (!logs) return '0'
    const topics = logs[logs.length - 1].topics

    switch (function_name) {
      case FunctionNames.DEPOSIT:
      case FunctionNames.WITHDRAW:
      case FunctionNames.SUBMIT_CLAIM:
        if (!topics || topics.length <= 0) return '0'
        return topics[topics.length - 1]
      case FunctionNames.WITHDRAW_CLAIMS_PAYOUT:
        if (!topics || topics.length <= 0) return '0'
        return topics[1]
      case FunctionNames.BUY_POLICY:
      case FunctionNames.EXTEND_POLICY:
      case FunctionNames.CANCEL_POLICY:
      case FunctionNames.DEPOSIT_ETH:
      case FunctionNames.DEPOSIT_CP:
      case FunctionNames.WITHDRAW_ETH:
      case FunctionNames.WITHDRAW_REWARDS:
      case FunctionNames.DEPOSIT_LP:
      case FunctionNames.WITHDRAW_LP:
      default:
        if (!logs || logs.length <= 0) return '0'
        const data = logs[logs.length - 1].data
        if (!data) return '0'
        return logs[logs.length - 1].data
    }
  }

  const getTransactionAmounts = async () => {
    if (txList) {
      const currentAmounts = []
      for (const tx of txList) {
        const function_name = decodeInput(tx, chainId ?? DEFAULT_CHAIN_ID, contractArray).function_name
        const amount: string = await getTransactionAmount(function_name, tx, library)
        currentAmounts.push(`${formatTransactionContent(function_name, amount)}`)
      }
      setAmounts(currentAmounts)
    }
  }

  useEffect(() => {
    getTransactionAmounts()
  }, [library, txList])

  return amounts
}
