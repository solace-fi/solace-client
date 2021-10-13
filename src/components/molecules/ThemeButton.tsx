/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components

    styled components

    ThemeButton function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
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

    custom hooks

  *************************************************************************************/
  const { appTheme, toggleTheme } = useGeneral()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <>
      <Button widthP={100} nohover noborder onClick={() => toggleTheme()} {...props}>
        {appTheme == 'light' ? <StyledSun size={30} /> : <StyledMoon size={30} />}
      </Button>
    </>
  )
}
