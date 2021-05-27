import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { formatEther, parseEther } from '@ethersproject/units'
import { Function_Name } from '../utils/decoder'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { decodeInput } from '../utils/decoder'
import { Unit } from '../utils/formatting'
import { POW_EIGHTEEN } from '../constants'

export const getTransactionAmount = async (
  function_name: string,
  tx: any,
  provider: Web3Provider | Provider
): Promise<string> => {
  const receipt = await provider.getTransactionReceipt(tx.hash)
  const logs = receipt.logs

  switch (function_name) {
    case Function_Name.DEPOSIT:
    case Function_Name.WITHDRAW_VAULT:
      const topics = logs[logs.length - 1].topics
      return topics[topics.length - 1]
    case Function_Name.DEPOSIT_ETH:
    case Function_Name.DEPOSIT_CP:
    case Function_Name.WITHDRAW_CP:
    case Function_Name.WITHDRAW_REWARDS:
    case Function_Name.DEPOSIT_LP:
    case Function_Name.WITHDRAW_LP:
    default:
      return logs[logs.length - 1].data
  }
}

const getUnit = (function_name: string): string => {
  switch (function_name) {
    case Function_Name.DEPOSIT:
    case Function_Name.WITHDRAW_VAULT:
    case Function_Name.DEPOSIT_ETH:
    case Function_Name.APPROVE:
      return Unit.ETH
    case Function_Name.DEPOSIT_CP:
    case Function_Name.WITHDRAW_CP:
      return Unit.SCP
    case Function_Name.WITHDRAW_REWARDS:
      return Unit.SOLACE
    case Function_Name.DEPOSIT_LP:
    case Function_Name.WITHDRAW_LP:
    default:
      return 'LP'
  }
}

export const useTransactionDetails = (txList: any): string[] => {
  const { library } = useWallet()
  const [amounts, setAmounts] = useState<string[]>([])

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
