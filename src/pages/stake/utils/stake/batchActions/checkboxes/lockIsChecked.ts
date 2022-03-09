import { BigNumber } from 'ethers'
import { CheckboxData } from '../../../../types/LockCheckbox'

/**
 * @name boxIsChecked
 * @description Checks if a checkbox is checked
 * @param checkboxArray The array of checkboxes
 * @param ID The ID to check
 * @returns The checked status of the checkbox
 * @example boxIsChecked(checkboxArray, ID)
 */

const boxIsChecked = (checkboxArray: CheckboxData[], ID: BigNumber): boolean =>
  checkboxArray.find(({ id: _id }) => _id.eq(ID))?.checked ?? false

export default boxIsChecked
