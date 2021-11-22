import { useEffect, useState, useMemo } from 'react'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'

import { useNotifications } from '../context/NotificationsManager'
import { useNetwork } from '../context/NetworkManager'
import { useCachedData } from '../context/CachedDataManager'

import { GAS_LIMIT, POW_NINE, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { GasFeeOption, LocalTx } from '../constants/types'

import { useGetFunctionGas } from './useGas'

import { fixed, filteredAmount } from '../utils/formatting'

export const useInputAmount = () => {
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { makeTxToast } = useNotifications()
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption | undefined>(gasPrices.selected)
  const { getGasConfig } = useGetFunctionGas()
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

  const calculateMaxAmount = (balance: BigNumber, amountDecimals: number, func?: FunctionName) => {
    const bal = formatUnits(balance, amountDecimals)
    if (!func || func !== FunctionName.DEPOSIT_ETH || !selectedGasOption) return bal
    const gasInEth = (GAS_LIMIT / POW_NINE) * selectedGasOption.value
    return Math.max(fixed(fixed(bal, 6) - fixed(gasInEth, 6), 6), 0)
  }

  const handleInputChange = (input: string) => {
    setAmount(filteredAmount(input, amount))
    setMaxSelected(false)
  }

  const setMax = (balance: BigNumber, balanceDecimals: number, func?: FunctionName) => {
    setAmount(calculateMaxAmount(balance, balanceDecimals, func).toString())
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
