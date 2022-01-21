import { BigNumber } from 'ethers'
import { LockCheckbox } from '../../../../types/LockCheckbox'

/**
 * @name updateLockCheck
 * @description Updates the checkbox array with the new lock check
 * @param checkboxArray The array of checkboxes
 * @param lockID The lock ID to update
 * @param checked The new checked status
 * @returns The updated array of checkboxes
 */

const updateLockCheck = (checkboxArray: LockCheckbox[], lockID: BigNumber, checked: boolean): LockCheckbox[] =>
  checkboxArray.map(({ xsLockID, checked: lockChecked }) => {
    if (xsLockID.eq(lockID)) {
      return { xsLockID, checked: checked }
    }
    return { xsLockID, checked: lockChecked }
  })

export default updateLockCheck
