import { CheckboxData, VoteLockData } from '../../../constants/types'

/**
 * @name getCheckedLocks
 * @description Compares an array of locks with an array of checkboxes
 * @param lockArray The array of locks
 * @param checkboxArray The array of checkboxes
 * @returns The array of locks with all locks checked
 */
const getCheckedLocks = (lockArray: VoteLockData[], checkboxArray: CheckboxData[]): VoteLockData[] => {
  // find all xsLockIDs in the checkbox array, and return the corresponding locks
  return lockArray.filter((lock) => {
    return checkboxArray.find((checkbox) => {
      if (checkbox.id === undefined) console.log('undefined ID lock', JSON.stringify(checkbox))
      return checkbox.id.toString() === lock.lockID.toString() && checkbox.checked
    })
  })
}

export default getCheckedLocks
