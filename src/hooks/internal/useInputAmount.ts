import { useCallback, useState } from 'react'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'

import { useNotifications } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

import { POW_NINE, ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'

import { fixed, filterAmount, formatAmount } from '../../utils/formatting'

export const useTransactionExecution = () => {
  const { addLocalTransactions, positiveReload, negativeReload } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { activeNetwork } = useNetwork()

  const handleToast = async (tx: TransactionResponse | null, localTx: LocalTx | null) => {
    if (!tx || !localTx) return false
    addLocalTransactions(localTx)
    negativeReload()
    makeTxToast(localTx.type, TransactionCondition.PENDING, localTx.hash)
    return await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: TransactionReceipt) => {
      const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
      makeTxToast(localTx.type, status, localTx.hash)
      positiveReload()
      return status == TransactionCondition.SUCCESS ? true : false
    })
  }

  const handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    console.log(functionName, err)
    makeTxToast(txType, TransactionCondition.CANCELLED, undefined, err)
    negativeReload()
  }

  return { handleToast, handleContractCallError }
}

export const useInputAmount = () => {
  const { activeNetwork } = useNetwork()
  const { gasData } = useCachedData()
  const [amount, setAmount] = useState<string>('')
  const [maxSelected, setMaxSelected] = useState<boolean>(false)

  const isAppropriateAmount = useCallback(
    (amount: string, amountDecimals: number, assetBalance: BigNumber): boolean => {
      if (!amount || amount == '.' || parseUnits(amount, amountDecimals).lte(ZERO)) return false
      return assetBalance.gte(parseUnits(amount, amountDecimals))
    },
    []
  )

  const calculateMaxAmount = useCallback(
    (balance: BigNumber, amountDecimals: number, gasLimit?: number) => {
      const bal = formatUnits(balance, amountDecimals)
      if (!gasLimit || !gasData) return bal
      // if currency to send is also for paying gas, subtract gas from amount to send
      const gasInCurrency = (gasLimit / POW_NINE) * gasData.gasPrice
      return Math.max(fixed(fixed(bal, 6) - fixed(gasInCurrency, 6), 6), 0)
    },
    [gasData]
  )

  const handleInputChange = useCallback(
    (input: string, maxDecimals?: number, maxBalance?: string) => {
      const filtered = filterAmount(input, amount)
      const formatted = formatAmount(filtered)
      if (
        filtered.includes('.') &&
        filtered.split('.')[1]?.length > (maxDecimals ?? activeNetwork.nativeCurrency.decimals)
      )
        return
      if (maxBalance && parseUnits(formatted, maxDecimals ?? 18).gt(parseUnits(maxBalance, maxDecimals ?? 18))) return
      setAmount(filtered)
      setMaxSelected(false)
    },
    [amount, activeNetwork.nativeCurrency.decimals]
  )

  const setMax = useCallback(
    (balance: BigNumber, balanceDecimals: number, gasLimit?: number) => {
      const calculatedMaxAmount = calculateMaxAmount(balance, balanceDecimals, gasLimit)
      setAmount(calculatedMaxAmount.toString())
      setMaxSelected(true)
    },
    [calculateMaxAmount]
  )

  const resetAmount = useCallback(() => {
    setAmount('')
    setMaxSelected(false)
  }, [])

  return {
    amount,
    maxSelected,
    isAppropriateAmount,
    handleInputChange,
    setMax,
    resetAmount,
  }
}
