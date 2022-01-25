import { BigNumber } from 'ethers'
import { ZERO } from '../../../../../../constants'
import { LockData } from '../../../../../../constants/types'

/**
 * @description Calculates the total amount of rewards that can be harvested from the user's locks
 * @param locks The user's locks
 * @returns The total amount of rewards that can be harvested from the user's locks
 * @example calculateTotalHarvest(locks)
 */
const calculateTotalHarvest = (locks: LockData[]): BigNumber =>
  locks.reduce((acc, lock) => acc.add(lock.pendingRewards), ZERO)

export default calculateTotalHarvest
