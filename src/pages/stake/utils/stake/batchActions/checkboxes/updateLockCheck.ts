import { BigNumber } from 'ethers'
import { CheckboxData } from '../../../../types/LockCheckbox'

/**
 * @name updateLockCheck
 * @description Updates the checkbox array with the new check
 * @param checkboxArray The array of checkboxes
 * @param id The ID to update
 * @param checked The new checked status
 * @returns The updated array of checkboxes
 */

const updateLockCheck = (checkboxArray: CheckboxData[], id: BigNumber, checked: boolean): CheckboxData[] =>
  checkboxArray.map(({ id: _id, checked: lockChecked }) => {
    if (_id.eq(id)) {
      return { id: _id, checked: checked }
    }
    return { id: _id, checked: lockChecked }
  })

export default updateLockCheck
