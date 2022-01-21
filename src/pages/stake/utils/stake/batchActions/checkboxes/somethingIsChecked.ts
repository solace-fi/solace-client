import { LockCheckbox } from '../../../../types/LockCheckbox'

const somethingIsChecked = (lockCheckboxArray: LockCheckbox[]): boolean =>
  lockCheckboxArray.some(({ checked }) => checked)

export default somethingIsChecked
