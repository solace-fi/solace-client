import React from 'react'
import { SwitchInput, SwitchButton, SwitchLabel } from './Styled'

const ToggleSwitch = ({
  id,
  toggled,
  onChange,
}: {
  id: string
  toggled: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}): JSX.Element => {
  return (
    <>
      <SwitchInput id={id} type="checkbox" checked={toggled} onChange={onChange} />
      <SwitchLabel htmlFor={id} checked={toggled}>
        <SwitchButton />
      </SwitchLabel>
    </>
  )
}

export default ToggleSwitch
