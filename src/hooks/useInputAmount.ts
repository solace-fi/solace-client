import { useEffect, useState, useMemo } from 'react'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'

import { useNotifications } from '../context/NotificationsManager'
import { useCachedData } from '../context/CachedDataManager'
import { useNetwork } from '../context/NetworkManager'

import { POW_NINE, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { GasFeeOption, LocalTx } from '../constants/types'

import { useGetFunctionGas } from './useGas'

import { fixed, filterAmount, formatAmount } from '../utils/formatting'

export const useTransactionExecution = () => {
  const { addLocalTransactions, reload } = useCachedData()
  const { makeTxToast } = useNotifications()

  const handleToast = async (tx: any, localTx: LocalTx | null) => {
    if (!tx || !localTx) return
    addLocalTransactions(localTx)
    reload()
    makeTxToast(localTx.type, TransactionCondition.PENDING, localTx.hash)
    await tx.wait().then((receipt: any) => {
      const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
      makeTxToast(localTx.type, status, localTx.hash)
      reload()
    })
  }

  const handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    console.log(functionName, err)
    makeTxToast(txType, TransactionCondition.CANCELLED)
    reload()
  }

  return { handleToast, handleContractCallError }
}

export const useInputAmount = () => {
  const { currencyDecimals } = useNetwork()
  const { gasPrices } = useCachedData()
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption | undefined>(gasPrices.selected)
  const { getGasConfig } = useGetFunctionGas()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const gasConfig = useMemo(() => getGasConfig(selectedGasOption ? selectedGasOption.value : undefined), [
    selectedGasOption,
    getGasConfig,
  ])
  const [amount, setAmount] = useState<string>('')
  const [maxSelected, setMaxSelected] = useState<boolean>(false)

  const isAppropriateAmount = (amount: string, amountDecimals: number, assetBalance: BigNumber): boolean => {
    if (!amount || amount == '.' || parseUnits(amount, amountDecimals).lte(ZERO)) return false
    return assetBalance.gte(parseUnits(amount, amountDecimals))
  }

  const handleSelectGasChange = (option: GasFeeOption | undefined) => setSelectedGasOption(option)

  const calculateMaxAmount = (balance: BigNumber, amountDecimals: number, gasLimit?: number) => {
    const bal = formatUnits(balance, amountDecimals)
    if (!gasLimit || !selectedGasOption?.value) return bal
    const gasInCurrency = (gasLimit / POW_NINE) * selectedGasOption.value
    return Math.max(fixed(fixed(bal, 6) - fixed(gasInCurrency, 6), 6), 0)
  }

  const handleInputChange = (input: string, maxDecimals?: number, maxBalance?: string) => {
    const filtered = filterAmount(input, amount)
    const formatted = formatAmount(filtered)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > (maxDecimals ?? currencyDecimals)) return
    if (maxBalance && parseUnits(formatted, 18).gt(parseUnits(maxBalance, 18))) return
    setAmount(filtered)
    setMaxSelected(false)
  }

  const setMax = (balance: BigNumber, balanceDecimals: number, gasLimit?: number) => {
    const calculatedMaxAmount = calculateMaxAmount(balance, balanceDecimals, gasLimit)
    setAmount(calculatedMaxAmount.toString())
    setMaxSelected(true)
  }

  const resetAmount = () => {
    setAmount('')
    setMaxSelected(false)
  }

  useEffect(() => {
    if (!gasPrices.selected) return
    handleSelectGasChange(gasPrices.selected)
  }, [gasPrices])

  return {
    gasConfig,
    gasPrices,
    selectedGasOption,
    amount,
    maxSelected,
    handleSelectGasChange,
    isAppropriateAmount,
    handleToast,
    handleContractCallError,
    calculateMaxAmount,
    handleInputChange,
    setMax,
    setAmount,
    resetAmount,
  }
}
