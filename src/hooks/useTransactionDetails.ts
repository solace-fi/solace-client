import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { decodeInput } from '../utils/decoder'
import { FunctionName } from '../constants/enums'
import { formatTransactionContent } from '../utils/formatting'

export const useTransactionDetails = (txList: any): string[] => {
  const { library } = useWallet()
  const [amounts, setAmounts] = useState<string[]>([])

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
      case FunctionName.DEPOSIT:
      case FunctionName.WITHDRAW:
      case FunctionName.SUBMIT_CLAIM:
        if (!topics || topics.length <= 0) return '0'
        return topics[topics.length - 1]
      case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
        if (!topics || topics.length <= 0) return '0'
        return topics[1]
      case FunctionName.BUY_POLICY:
      case FunctionName.EXTEND_POLICY:
      case FunctionName.CANCEL_POLICY:
      case FunctionName.DEPOSIT_ETH:
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_ETH:
      case FunctionName.WITHDRAW_REWARDS:
      case FunctionName.DEPOSIT_LP:
      case FunctionName.WITHDRAW_LP:
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
        const function_name = decodeInput(tx).function_name
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
