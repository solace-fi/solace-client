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
  if (typeof value == 'string') {
    const pureNumberStr = value.replace('.', '').split('e')[0]
    if (BigNumber.from(pureNumberStr).eq('0')) {
      return '0'
    }
  }
  let str = value.toString()

  // if string is in scientific notation, for example (1.2345e3, or 1.2345e-5)
  if (str.includes('e')) {
    // get number left of 'e'
    const n = str.split('e')[0]

    // get number right of 'e'
    const exponent = str.split('e')[1]

    // remove decimal in advance
    const temp = n.replace('.', '')
    let zeros = ''
    if (exponent.includes('-')) {
      // if exponent has negative sign, it must be negative
      const range = rangeFrom0(parseInt(exponent.slice(1)) - 1)
      range.forEach(() => (zeros += '0'))
      str = '0.'.concat(zeros).concat(temp) // add abs(exponent) - 1 zeros to the left of temp
    } else {
      // if exponent does not have negative sign, it must be positive
      if (n.split('.')[1].length > parseInt(exponent)) {
        // if length of decimal places in string surpasses exponent, must insert decimal point inside
        const decimalIndex = n.indexOf('.')
        const newDecimalIndex = decimalIndex + parseInt(exponent)
        str = temp.substring(0, newDecimalIndex).concat('.').concat(temp.substring(newDecimalIndex, temp.length))
      } else {
        // if length of decimal places in string does not surpass exponent, simply append zeros
        const range = rangeFrom0(parseInt(exponent) - n.split('.')[1].length)
        range.forEach(() => (zeros += '0'))
        str = temp.concat(zeros)
      }
    }
  }
  const decimalIndex = str.indexOf('.')

  // if is nonzero whole number
  if (decimalIndex == -1) {
    return numberAbbreviate(str)
  }

  // if is nonzero number with decimals
  const cutoffIndex = decimalIndex + decimals
  const truncatedStr = str.substring(0, cutoffIndex + 1)
  if (parseFloat(truncatedStr) == 0) {
    return `< ${truncatedStr.slice(0, -1) + '1'}`
  }
  return numberAbbreviate(truncatedStr)
}

export const numberAbbreviate = (value: number | string, decimals = 2): string => {
  if (typeof value == 'number' && value == 0) return '0'
  if (typeof value == 'string' && BigNumber.from(value.replace('.', '')).eq('0')) return '0'
  const str = value.toString()
  const decimalIndex = str.indexOf('.')
  let wholeNumber = str
  if (decimalIndex != -1) {
    wholeNumber = str.substring(0, decimalIndex)
  }
  if (wholeNumber.length <= 3) return str

  const abbreviations: any = {
    [2]: 'K',
    [3]: 'M',
    [4]: 'B',
    [5]: 'T',
  }
  const abbrev = abbreviations[Math.ceil(wholeNumber.length / 3)]
  const cutoff = wholeNumber.length % 3 == 0 ? 3 : wholeNumber.length % 3
  const a = wholeNumber.substring(0, cutoff)
  const b = wholeNumber.substring(cutoff, cutoff + decimals)
  if (!abbrev) {
    return `${a}.${b}e${wholeNumber.length - cutoff}`
  }
  return `${a}.${b}${abbrev}`
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
  const finalRes = result.replace(/^0+/, '')
  if (finalRes == '') return result
  return finalRes
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

export const floatUnits = (value: BigNumber, decimals: number): number => parseFloat(formatUnits(value, decimals))

// used for correctly user amount input before processing
export const filteredAmount = (input: string, amount: string): string => {
  if (!amount && input == '.') input = '.'
  const filteredAmount = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
  return filteredAmount
}

// truncate strings, mostly addresses
export const shortenAddress = (input: string): string =>
  `${input.substring(0, 6)}...${input.substring(input.length - 4, input.length)}`

// get unit based on function name
export const getUnit = (function_name: string, activeNetwork?: NetworkConfig): Unit => {
  switch (function_name) {
    case FunctionName.DEPOSIT_ETH:
    case FunctionName.WITHDRAW_ETH:
    case FunctionName.APPROVE:
      return activeNetwork ? activeNetwork.nativeCurrency.symbol : Unit._
    case FunctionName.DEPOSIT_CP:
    case FunctionName.WITHDRAW_CP:
      return Unit.SCP
    case FunctionName.WITHDRAW_REWARDS:
      return Unit.SOLACE
    case FunctionName.DEPOSIT_LP_SIGNED:
    case FunctionName.WITHDRAW_LP:
    case FunctionName.MULTI_CALL:
      return Unit.LP
    case FunctionName.DEPOSIT_POLICY_SIGNED:
    case FunctionName.WITHDRAW_POLICY:
    case FunctionName.BUY_POLICY:
    case FunctionName.CANCEL_POLICY:
    case FunctionName.EXTEND_POLICY_PERIOD:
    case FunctionName.UPDATE_POLICY_AMOUNT:
    case FunctionName.UPDATE_POLICY:
    case FunctionName.SUBMIT_CLAIM:
      return Unit.POLICY
    case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
      return Unit.CLAIM
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
  if (amount == '') return 'N/A'
  const unit = getUnit(function_name, activeNetwork)
  switch (function_name) {
    case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
    case FunctionName.BUY_POLICY:
    case FunctionName.EXTEND_POLICY_PERIOD:
    case FunctionName.UPDATE_POLICY:
    case FunctionName.UPDATE_POLICY_AMOUNT:
    case FunctionName.CANCEL_POLICY:
    case FunctionName.SUBMIT_CLAIM:
    case FunctionName.DEPOSIT_POLICY_SIGNED:
    case FunctionName.WITHDRAW_POLICY:
      return `${unit} #${BigNumber.from(amount)}`
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
    case FunctionName.DEPOSIT_LP_SIGNED:
    case FunctionName.WITHDRAW_LP:
      return `#${BigNumber.from(amount)} ${unit}`
    case FunctionName.START_COOLDOWN:
      return `Thaw started`
    case FunctionName.STOP_COOLDOWN:
      return `Thaw stopped`
    case FunctionName.DEPOSIT_POLICY_SIGNED_MULTI:
    case FunctionName.WITHDRAW_POLICY_MULTI:
      return `Multiple policies`
    default:
      return `${amount} ${unit}`
  }
}

export const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase().concat(str.slice(1))

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

export const trim0x = (address: string): string =>
  address.startsWith('0x') ? address.slice(2).toLowerCase() : address.toLowerCase()
