import { LockData } from '../../../../../../constants/types'
import { LockCheckbox } from '../../../../types/LockCheckbox'

/**
 * @name getCheckedLocks
 * @description Compares an array of locks with an array of checkboxes
 * @param lockArray The array of locks
 * @param checkboxArray The array of checkboxes
 * @returns The array of locks with all locks checked
 */
const getCheckedLocks = (lockArray: LockData[], checkboxArray: LockCheckbox[]): LockData[] => {
  // find all xsLockIDs in the checkbox array, and return the corresponding locks
  console.log('CHECKBOXES: ', checkboxArray)
  return lockArray.filter((lock) => {
    return checkboxArray.find((checkbox) => {
      if (checkbox.xsLockID === undefined) console.log('undefined ID lock', JSON.stringify(checkbox))
      return checkbox.xsLockID.eq(lock.xsLockID) && checkbox.checked
    })
  })
}

// const checkedLocks: LockData[] = []
// lockArray.forEach((lock, index) => {
//   if (checkboxArray[index].checked) {
//     checkedLocks.push(lock)
//   }
// })
// return checkedLocks
// }
//   lockArray.filter(
//     ({ xsLockID }) => checkboxArray.find(({ xsLockID: lockID }) => lockID.eq(xsLockID))?.checked ?? false
//   )

export default getCheckedLocks
