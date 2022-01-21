import { LockCheckbox } from '../../../../types/LockCheckbox'

const allLocksAreChecked = (locks: LockCheckbox[]): boolean => locks.every(({ checked }) => checked)

export default allLocksAreChecked
