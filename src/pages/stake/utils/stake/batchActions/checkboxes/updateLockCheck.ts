import { BigNumber } from 'ethers'
import { CheckboxData } from '../../../../types/LockCheckbox'

/**
 * @name updateCheck
 * @description Updates the checkbox array with the new check
 * @param checkboxArray The array of checkboxes
 * @param id The ID to update
 * @param checked The new checked status
 * @returns The updated array of checkboxes
 */

const updateCheck = (checkboxArray: CheckboxData[], ID: BigNumber, checked: boolean): CheckboxData[] =>
  checkboxArray.map(({ id: _id, checked: boxChecked }) => {
    if (_id.eq(ID)) {
      return { id: _id, checked: checked }
    }
    return { id: _id, checked: boxChecked }
  })

export default updateCheck
