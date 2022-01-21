import { BigNumber } from 'ethers'
import { ZERO } from '../../../../../../constants'
import { LockData } from '../../../../../../constants/types'

/**
 * @description Calculates the total amount of tokens that can be withdrawn from the user's locks
 * @param locks The user's locks
 * @returns The total amount of tokens that can be withdrawn from the user's locks
 * @example calculateTotalWithdrawable(locks)
 */
const calculateTotalWithdrawable = (locks: LockData[]): BigNumber =>
  locks.reduce((acc, lock) => (lock.timeLeft.isZero() ? acc.add(lock.unboostedAmount) : acc), ZERO)

// if (!lock.timeLeft.isZero()) return acc
// return acc.add(lock.unboostedAmount)
export default calculateTotalWithdrawable
