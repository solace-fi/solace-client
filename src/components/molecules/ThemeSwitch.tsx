/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components
    import hooks

    ThemeSwitch function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */

/* import components */
import { StyledTheme, StyledSun, StyledMoon } from '../atoms/Icon'
import { Switch, SwitchLabel, SwitchRadio, SwitchSelection } from '../atoms/Switch'
/* import hooks */

const values = ['light', 'auto', 'dark']

export const ThemeSwitch: React.FC = () => {
  const { selectedTheme, toggleTheme } = useGeneral()

  const titleCase = (str: string) =>
    str
      .split(/\s+/)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ')

  const handleChange = (val: string) => {
    toggleTheme(val)
  }

  const selectionStyle = () => {
    return {
      left: `${(values.indexOf(selectedTheme ?? 'auto') / 3) * 100}%`,
    }
  }

  return (
    <Switch>
      {values.map((val: string) => {
        return (
          <span key={val}>
            <SwitchRadio readOnly type="radio" name="switch" checked={(selectedTheme ?? 'auto') === val} />
            <SwitchLabel onClick={() => handleChange(val)}>
              {val == 'light' && <StyledSun size={25} />}
              {val == 'auto' && <StyledTheme size={25} />}
              {val == 'dark' && <StyledMoon size={25} />}
              {/* <>{titleCase(val)}</> */}
            </SwitchLabel>
          </span>
        )
      })}
      <SwitchSelection style={selectionStyle()} />
    </Switch>
  )
}
