import { CheckboxData } from '../constants/types'

export const somethingIsChecked = (checkboxArray: CheckboxData[]): boolean =>
  checkboxArray.some(({ checked }) => checked)

/**
 * @name updateBoxCheck
 * @description Updates the checkbox array with the new check
 * @param checkboxArray The array of checkboxes
 * @param id The ID to update
 * @param checked The new checked status
 * @returns The updated array of checkboxes
 */

export const updateBoxCheck = (checkboxArray: CheckboxData[], ID: string, checked: boolean): CheckboxData[] =>
  checkboxArray.map(({ id: _id, checked: boxChecked }) => {
    if (_id === ID) {
      return { id: _id, checked: checked }
    }
    return { id: _id, checked: boxChecked }
  })

export const allBoxesAreChecked = (boxes: CheckboxData[]): boolean => boxes.every(({ checked }) => checked)

/**
 * @name checkAllBoxes
 * @description Takes an array of lock checkboxes and returns an array of locks with all locks checked
 * @param checkboxArray The array of lock checkboxes
 * @returns The array of locks with all locks checked
 * @example checkAllLocks(lockArray)
 */

export const checkAllBoxes = (checkboxArray: CheckboxData[]): CheckboxData[] =>
  checkboxArray.map(({ id }) => ({
    id,
    checked: true,
  }))

/**
 * @name boxIsChecked
 * @description Checks if a checkbox is checked
 * @param checkboxArray The array of checkboxes
 * @param ID The ID to check
 * @returns The checked status of the checkbox
 * @example boxIsChecked(checkboxArray, ID)
 */

export const boxIsChecked = (checkboxArray: CheckboxData[], ID: string): boolean =>
  checkboxArray.find(({ id: _id }) => _id === ID)?.checked ?? false
