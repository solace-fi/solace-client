import { LockData } from '../../../../../../constants/types'
import { CheckboxData } from '../../../../types/LockCheckbox'

/**
 * @name updateLocksChecked
 * @description Checks if the user has any locks loaded, and then adds new locks on top of it
 * @param locks The user's locks
 * @param oldArray The old array of locks
 * @returns The updated array of locks
 * @example updateLocksChecked(locks, oldArray)
 */
const updateLocksChecked = (locks: LockData[], oldArray: CheckboxData[]): CheckboxData[] => {
  // if oldArray is empty (component was just rendered), return the new locks, all unchecked
  if (oldArray.length === 0) return locks.map((lock) => ({ id: lock.xsLockID, checked: false }))
  // we check which locks have already been loaded (they may be checked)
  return locks.map((lock) => {
    // we check if this lock is already in the array (it is already rendered on client-side)
    const oldBox = oldArray.find((oldBox) => oldBox.id.eq(lock.xsLockID))
    return oldBox
      ? // if it is, we return this lock's id with the same checked status so as not to disturb the user
        { id: lock.xsLockID, checked: oldBox.checked }
      : // otherwise, we return a new lock with default unchecked status to allow the user to interact with it
        { id: lock.xsLockID, checked: false }
  })
}

export default updateLocksChecked
