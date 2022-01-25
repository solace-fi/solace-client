import { LockData } from '../../../../../../constants/types'
import { LockCheckbox } from '../../../../types/LockCheckbox'

/**
 * @name updateLocksChecked
 * @description Checks if the user has any locks loaded, and then adds new locks on top of it
 * @param locks The user's locks
 * @param oldArray The old array of locks
 * @returns The updated array of locks
 * @example updateLocksChecked(locks, oldArray)
 */
const updateLocksChecked = (locks: LockData[], oldArray: LockCheckbox[]): LockCheckbox[] => {
  // if oldArray is empty (component was just rendered), return the new locks, all unchecked
  if (oldArray.length === 0) return locks.map((lock) => ({ xsLockID: lock.xsLockID, checked: false }))
  // we check which locks have already been loaded (they may be checked)
  return locks.map((lock) => {
    // we check if this lock is already in the array (it is already rendered on client-side)
    const oldLock = oldArray.find((oldLock) => oldLock.xsLockID.eq(lock.xsLockID))
    return oldLock
      ? // if it is, we return this lock's id with the same checked status so as not to disturb the user
        { xsLockID: lock.xsLockID, checked: oldLock.checked }
      : // otherwise, we return a new lock with default unchecked status to allow the user to interact with it
        { xsLockID: lock.xsLockID, checked: false }
  })
}

export default updateLocksChecked
