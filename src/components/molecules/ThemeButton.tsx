/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components

    ThemeButton function
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import managers */
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */

/* import components */
import { Button, ButtonProps } from '../atoms/Button'
import { StyledSun, StyledMoon } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

export const ThemeButton: React.FC<GeneralElementProps & ButtonProps> = ({ ...props }) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { appTheme, toggleTheme } = useGeneral()

  return (
    <>
      <Button widthP={100} nohover noborder onClick={() => toggleTheme()} {...props}>
        {appTheme == 'light' ? <StyledSun size={30} /> : <StyledMoon size={30} />}
      </Button>
    </>
  )
}
