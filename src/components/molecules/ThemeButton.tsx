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
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

export const ThemeButton: React.FC<GeneralElementProps & ButtonProps> = ({ ...props }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { selectedTheme, toggleTheme } = useGeneral()
  const { width } = useWindowDimensions()

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
        {width > MAX_MOBILE_SCREEN_WIDTH && ` Theme`}
      </Button>
    </>
  )
}
