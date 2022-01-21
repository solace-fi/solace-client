import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { truncateValue } from '../../../../../utils/formatting'

/**
 * @name formatShort
 * @description Formats a BigNumber to a short string with up to 2 decimal places
 * @param value The BigNumber to format
 * @param decimals The number of decimal places to show
 * @returns The formatted string
 * @example formatShort(bigNum)
 * @example formatShort(bigNum, 4)
 */

export const formatShort = (value: BigNumber, decimals?: number): string => {
  const stringified = value.toString()
  const ethersFormatted = formatUnits(stringified, 18)
  const truncated = truncateValue(ethersFormatted, decimals ?? 4)
  return truncated
}
