import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { FunctionName, Unit } from '../constants/enums'
import { NetworkConfig, TokenInfo } from '../constants/types'
import { rangeFrom0 } from './numeric'

// truncate numbers without rounding
export const fixed = (n: number | string, decimals = 1): number => {
  if (typeof n == 'string') {
    n = parseFloat(n)
  }
  return Math.floor(n * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export const truncateBalance = (value: number | string, decimals = 6): string => {
  if (typeof value == 'number' && value == 0) return '0'
  if (typeof value == 'string' && BigNumber.from(value.replace('.', '')).eq('0')) return '0'
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

export const accurateMultiply = (value: number | string, decimals: number): string => {
  let result = typeof value == 'number' ? value.toString() : value
  const decimalIndex = result.indexOf('.')
  if (decimalIndex == -1) {
    const range = rangeFrom0(decimals)
    range.forEach(() => (result += '0'))
    return result
  }
  if (result.indexOf('.') != result.lastIndexOf('.')) return result
  const currentNumDecimalPlaces = result.length - decimalIndex - 1
  const decimalPlacesToAdd = decimals - currentNumDecimalPlaces
  result = result.substr(0, decimalIndex).concat(result.substr(decimalIndex + 1, result.length))
  const range = rangeFrom0(decimalPlacesToAdd)
  range.forEach(() => (result += '0'))
  return result.replace(/^0+/, '')
}

export const fixedTokenPositionBalance = (token: TokenInfo): number => {
  return parseFloat(BigNumber.from(token.balance).toString()) / Math.pow(10, token.decimals)
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

export const floatUnits = (value: BigNumber, decimals: number): number => {
  return parseFloat(formatUnits(value, decimals))
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
export const getUnit = (function_name: string, activeNetwork: NetworkConfig): Unit => {
  switch (function_name) {
    case FunctionName.DEPOSIT_ETH:
    case FunctionName.WITHDRAW_ETH:
    case FunctionName.APPROVE:
      return activeNetwork.nativeCurrency.symbol
    case FunctionName.DEPOSIT_CP:
    case FunctionName.WITHDRAW_CP:
      return Unit.SCP
    case FunctionName.WITHDRAW_REWARDS:
      return Unit.SOLACE
    case FunctionName.DEPOSIT_SIGNED:
    case FunctionName.WITHDRAW_LP:
    case FunctionName.MULTI_CALL:
      return Unit.LP
    case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
    case FunctionName.BUY_POLICY:
    case FunctionName.CANCEL_POLICY:
    case FunctionName.EXTEND_POLICY_PERIOD:
    case FunctionName.UPDATE_POLICY_AMOUNT:
    case FunctionName.UPDATE_POLICY:
    case FunctionName.SUBMIT_CLAIM:
      return Unit.ID
    case FunctionName.START_COOLDOWN:
    case FunctionName.STOP_COOLDOWN:
    default:
      return Unit._
  }
}

export const formatTransactionContent = (
  function_name: string,
  amount: string,
  activeNetwork: NetworkConfig
): string => {
  const unit = getUnit(function_name, activeNetwork)
  switch (function_name) {
    case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
      return `Claim ${unit} ${BigNumber.from(amount)}`
    case FunctionName.BUY_POLICY:
    case FunctionName.EXTEND_POLICY_PERIOD:
    case FunctionName.UPDATE_POLICY:
    case FunctionName.UPDATE_POLICY_AMOUNT:
    case FunctionName.CANCEL_POLICY:
    case FunctionName.SUBMIT_CLAIM:
      return `Policy ${unit} ${BigNumber.from(amount)}`
    case FunctionName.WITHDRAW_ETH:
      return `${truncateBalance(formatUnits(BigNumber.from(amount), activeNetwork.nativeCurrency.decimals))} ${unit}`
    case FunctionName.WITHDRAW_LP:
      return `#${BigNumber.from(amount)} ${Unit.LP}`
    case FunctionName.DEPOSIT_ETH:
    case FunctionName.DEPOSIT_CP:
    case FunctionName.WITHDRAW_CP:
    case FunctionName.WITHDRAW_REWARDS:
    case FunctionName.APPROVE:
      return `${truncateBalance(formatUnits(BigNumber.from(amount), activeNetwork.nativeCurrency.decimals))} ${unit}`
    case FunctionName.DEPOSIT_SIGNED:
    case FunctionName.WITHDRAW_LP:
      return `#${BigNumber.from(amount)} ${unit}`
    case FunctionName.START_COOLDOWN:
      return `Withdrawal cooldown started`
    case FunctionName.STOP_COOLDOWN:
      return `Withdrawal cooldown stopped`
    default:
      return `${amount} ${unit}`
  }
}

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase().concat(str.slice(1))
}

export function encodeAddresses(addresses: string[]): string {
  let encoded = '0x'
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i]
    if (address.length != 42 || address.substring(0, 2) != '0x') {
      throw new Error(`invalid address: ${address}`)
    }
    // 20 byte encoding of the address
    encoded += address.slice(2).toLowerCase()
  }
  return encoded
}
