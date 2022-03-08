import { CheckboxData } from '../../../../types/LockCheckbox'

const somethingIsChecked = (checkboxArray: CheckboxData[]): boolean => checkboxArray.some(({ checked }) => checked)

export default somethingIsChecked
