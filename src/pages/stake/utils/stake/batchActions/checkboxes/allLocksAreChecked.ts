import { CheckboxData } from '../../../../types/LockCheckbox'

const allBoxesAreChecked = (boxes: CheckboxData[]): boolean => boxes.every(({ checked }) => checked)

export default allBoxesAreChecked
