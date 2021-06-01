import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { decodeInput } from '../utils/decoder'
import { POW_EIGHTEEN } from '../constants'
import { FunctionName } from '../constants/enums'
import { getUnit } from '../utils/formatting'

export const useTransactionDetails = (txList: any): string[] => {
  const { library } = useWallet()
  const [amounts, setAmounts] = useState<string[]>([])

  const getTransactionAmount = async (
    function_name: string,
    tx: any,
    provider: Web3Provider | Provider
  ): Promise<string> => {
    const receipt = await provider.getTransactionReceipt(tx.hash)
    if (!receipt) return 'Unknown'
    const logs = receipt.logs
    if (!logs) return 'Unknown'

    switch (function_name) {
      case FunctionName.DEPOSIT:
      case FunctionName.WITHDRAW:
        const topics = logs[logs.length - 1].topics
        if (!topics || topics.length <= 0) return 'Unknown'
        return topics[topics.length - 1]
      case FunctionName.DEPOSIT_ETH:
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_ETH:
      case FunctionName.WITHDRAW_REWARDS:
      case FunctionName.DEPOSIT_LP:
      case FunctionName.WITHDRAW_LP:
      default:
        if (!logs || logs.length <= 0) return 'Unknown'
        const data = logs[logs.length - 1].data
        if (!data) return 'Unknown'
        return logs[logs.length - 1].data
    }
  }

  const getTransactionAmounts = async () => {
    if (txList) {
      const currentAmounts = []
      for (const tx of txList) {
        const function_name = decodeInput(tx).function_name
        const unit = getUnit(function_name)
        const amount: string = await getTransactionAmount(function_name, tx, library)
        currentAmounts.push(`${parseInt(amount) / POW_EIGHTEEN} ${unit}`)
      }
      setAmounts(currentAmounts)
    }
  }

  useEffect(() => {
    getTransactionAmounts()
  }, [library, txList])

  return amounts
}
