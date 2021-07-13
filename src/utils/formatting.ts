import { formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { FunctionNames, Units } from '../constants/enums'

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

export const truncateBalance = (value: number | string, decimals = 6): string => {
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
export const getUnit = (function_name: string): Units => {
  switch (function_name) {
    case FunctionNames.DEPOSIT:
    case FunctionNames.WITHDRAW:
    case FunctionNames.DEPOSIT_ETH:
    case FunctionNames.APPROVE:
      return Units.ETH
    case FunctionNames.DEPOSIT_CP:
    case FunctionNames.WITHDRAW_ETH:
      return Units.SCP
    case FunctionNames.WITHDRAW_REWARDS:
      return Units.SOLACE
    case FunctionNames.DEPOSIT_LP:
    case FunctionNames.WITHDRAW_LP:
      return Units.LP
    case FunctionNames.WITHDRAW_CLAIMS_PAYOUT:
    default:
      return Units.ID
  }
}

export const formatTransactionContent = (function_name: string, amount: string): string => {
  const unit = getUnit(function_name)
  switch (function_name) {
    case FunctionNames.WITHDRAW_CLAIMS_PAYOUT:
      return `Claim ${unit} ${BigNumber.from(amount)}`
    case FunctionNames.BUY_POLICY:
    case FunctionNames.EXTEND_POLICY:
    case FunctionNames.CANCEL_POLICY:
    case FunctionNames.SUBMIT_CLAIM:
      return `Policy ${unit} ${BigNumber.from(amount)}`
    case FunctionNames.DEPOSIT:
    case FunctionNames.WITHDRAW:
    case FunctionNames.DEPOSIT_ETH:
    case FunctionNames.DEPOSIT_CP:
    case FunctionNames.WITHDRAW_ETH:
    case FunctionNames.WITHDRAW_REWARDS:
    case FunctionNames.DEPOSIT_LP:
    case FunctionNames.WITHDRAW_LP:
    default:
      return `${formatEther(BigNumber.from(amount))} ${unit}`
  }
}
