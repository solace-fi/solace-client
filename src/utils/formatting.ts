import { formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { FunctionName, Unit } from '../constants/enums'

// truncate numbers without rounding
export const fixed = (n: number, decimals = 1): number => {
  return Math.floor(n * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export const getNonHumanValue = (value: BigNumber | number, decimals = 0): BigNumber => {
  return BigNumber.from(value).mul(getExponentValue(decimals))
}

export const getGasValue = (price: number): number => {
  return getNonHumanValue(price, 9).toNumber()
}

export const getExponentValue = (decimals = 0): BigNumber => {
  return BigNumber.from(10).pow(decimals)
}

export const getHumanValue = (value?: BigNumber, decimals = 0): BigNumber | undefined => {
  return value?.div(getExponentValue(decimals))
}

export const floatEther = (value: BigNumber): number => {
  return parseFloat(formatEther(value))
}

// used for correctly user amount input before processing
export const filteredAmount = (input: string, amount: string): string => {
  if (!amount && input == '.') input = '.'
  const filteredAmount = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
  return filteredAmount
}

// truncate strings, mostly addresses
export const shortenAddress = (input: string): string => {
  return `${input.substring(0, 10)}...`
}

// get unit based on function name
export const getUnit = (function_name: string): Unit => {
  switch (function_name) {
    case FunctionName.DEPOSIT:
    case FunctionName.WITHDRAW:
    case FunctionName.DEPOSIT_ETH:
    case FunctionName.APPROVE:
      return Unit.ETH
    case FunctionName.DEPOSIT_CP:
    case FunctionName.WITHDRAW_ETH:
      return Unit.SCP
    case FunctionName.WITHDRAW_REWARDS:
      return Unit.SOLACE
    case FunctionName.DEPOSIT_LP:
    case FunctionName.WITHDRAW_LP:
    default:
      return Unit.LP
  }
}
