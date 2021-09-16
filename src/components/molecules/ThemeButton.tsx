/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components
    import hooks

    styled components

    WalletConnectButton function
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
import { StyledTheme, StyledSun, StyledMoon } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

/* import hooks */

export const ThemeButton: React.FC<GeneralElementProps & ButtonProps> = ({ ...props }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { selectedTheme, toggleTheme } = useGeneral()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <>
      <Button onClick={() => toggleTheme()} {...props}>
        {selectedTheme == 'light' ? (
          <StyledSun size={30} />
        ) : selectedTheme == 'dark' ? (
          <StyledMoon size={30} />
        ) : (
          <StyledTheme size={30} />
        )}

        {selectedTheme == 'light' ? 'Light' : selectedTheme == 'dark' ? 'Dark' : 'Auto'}
      </Button>
    </>
  )
}
