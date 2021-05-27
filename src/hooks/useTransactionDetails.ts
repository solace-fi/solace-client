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

    switch (function_name) {
      case FunctionName.DEPOSIT:
      case FunctionName.WITHDRAW_VAULT:
        const topics = logs[logs.length - 1].topics
        return topics[topics.length - 1]
      case FunctionName.DEPOSIT_ETH:
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_CP:
      case FunctionName.WITHDRAW_REWARDS:
      case FunctionName.DEPOSIT_LP:
      case FunctionName.WITHDRAW_LP:
      default:
        return logs[logs.length - 1].data
    }
  }

  const getTransactionAmounts = async () => {
    if (txList) {
      const currentAmounts = []
      for (const tx of txList) {
        const function_name = decodeInput(tx).function_name
        const unit = getUnit(function_name)
        const amount = await getTransactionAmount(function_name, tx, library)
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
