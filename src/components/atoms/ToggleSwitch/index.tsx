import React from 'react'
import { SwitchInput, SwitchButton, SwitchLabel } from './Styled'

const ToggleSwitch = ({
  id,
  toggled,
  onChange,
  width,
  height,
  buttonSize,
}: {
  id: string
  toggled: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  width?: number
  height?: number
  buttonSize?: number
}): JSX.Element => {
  return (
    <>
      <SwitchInput id={id} type="checkbox" checked={toggled} onChange={onChange} />
      <SwitchLabel htmlFor={id} checked={toggled} width={width} height={height}>
        <SwitchButton buttonSize={buttonSize} />
      </SwitchLabel>
    </>
  )
}

export default ToggleSwitch
