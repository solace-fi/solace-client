import { formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { FunctionName, Unit } from '../constants/enums'

// truncate numbers without rounding
export const fixed = (n: number, decimals = 1): number => {
  return Math.floor(n * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

type Token = {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string
}

export const truncateBalance = (value: number, decimals = 6): string => {
  const str = value.toString()
  const decimalIndex = str.indexOf('.')
  if (decimalIndex == -1) {
    return str
  }
  const cutoffIndex = decimalIndex + decimals
  const truncatedStr = str.substring(0, cutoffIndex + 1)
  if (parseFloat(truncatedStr) == 0) {
    return `< ${truncatedStr.slice(0, -1) + '1'}`
  }
  return truncatedStr
}

export const fixedTokenPositionBalance = (token: Token): number => {
  return parseFloat(token.balance) / Math.pow(10, token.decimals)
}

export const fixedPositionBalance = (balance: string, decimals: number): number => {
  if (!balance) return 0
  return parseFloat(balance) / Math.pow(10, decimals)
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
  return `${input.substring(0, 6)}...${input.substring(input.length - 4, input.length)}`
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
      return Unit.LP
    default:
      return Unit.ID
  }
}

export const formatTransactionContent = (function_name: string, amount: string): string => {
  const unit = getUnit(function_name)
  switch (function_name) {
    case FunctionName.BUY_POLICY:
    case FunctionName.EXTEND_POLICY:
    case FunctionName.CANCEL_POLICY:
    case FunctionName.SUBMIT_CLAIM:
      return `Policy ${unit} ${BigNumber.from(amount)}`
    case FunctionName.DEPOSIT:
    case FunctionName.WITHDRAW:
    case FunctionName.DEPOSIT_ETH:
    case FunctionName.DEPOSIT_CP:
    case FunctionName.WITHDRAW_ETH:
    case FunctionName.WITHDRAW_REWARDS:
    case FunctionName.DEPOSIT_LP:
    case FunctionName.WITHDRAW_LP:
    default:
      return `${formatEther(BigNumber.from(amount))} ${unit}`
  }
}
