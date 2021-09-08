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
import { Button } from '../atoms/Button'
import { StyledTheme } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

/* import hooks */

export const ThemeButton: React.FC<GeneralElementProps> = ({ ...props }) => {
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
        <StyledTheme size={30} />
        {selectedTheme == 'light' ? 'Light' : selectedTheme == 'dark' ? 'Dark' : 'Auto'}
      </Button>
    </>
  )
}
