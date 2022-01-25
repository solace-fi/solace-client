import { LockCheckbox } from '../../../../types/LockCheckbox'

/**
 * @name checkAllLocks
 * @description Takes an array of lock checkboxes and returns an array of locks with all locks checked
 * @param lockCheckboxArray The array of lock checkboxes
 * @returns The array of locks with all locks checked
 * @example checkAllLocks(lockArray)
 */

const checkAllLocks = (lockCheckboxArray: LockCheckbox[]): LockCheckbox[] =>
  lockCheckboxArray.map(({ xsLockID }) => ({
    xsLockID,
    checked: true,
  }))

export default checkAllLocks
