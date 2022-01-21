import { BigNumber } from 'ethers'
import { LockCheckbox } from '../../../../types/LockCheckbox'

/**
 * @name lockIsChecked
 * @description Checks if a lock checkbox is checked
 * @param lockCheckboxArray The array of lock checkboxes
 * @param xsLockID The lock ID to check
 * @returns The checked status of the lock checkbox
 * @example lockIsChecked(lockCheckboxArray, xsLockID)
 */

const lockIsChecked = (lockCheckboxArray: LockCheckbox[], xsLockID: BigNumber): boolean =>
  lockCheckboxArray.find(({ xsLockID: lockID }) => lockID.eq(xsLockID))?.checked ?? false

export default lockIsChecked
