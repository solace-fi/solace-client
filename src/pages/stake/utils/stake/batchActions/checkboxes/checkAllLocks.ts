import { CheckboxData } from '../../../../types/LockCheckbox'

/**
 * @name checkAllBoxes
 * @description Takes an array of lock checkboxes and returns an array of locks with all locks checked
 * @param checkboxArray The array of lock checkboxes
 * @returns The array of locks with all locks checked
 * @example checkAllLocks(lockArray)
 */

const checkAllBoxes = (checkboxArray: CheckboxData[]): CheckboxData[] =>
  checkboxArray.map(({ id }) => ({
    id,
    checked: true,
  }))

export default checkAllBoxes
