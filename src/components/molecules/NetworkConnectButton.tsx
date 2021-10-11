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
import { useProvider } from '../../context/ProviderManager'

/* import constants */

/* import components */
import { Button, ButtonProps } from '../atoms/Button'
import { StyledNetworkChart } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

/* import hooks */

export const NetworkConnectButton: React.FC<GeneralElementProps & ButtonProps> = ({ ...props }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { openNetworkModal } = useProvider()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <>
      <Button onClick={() => openNetworkModal()} {...props} style={{ whiteSpace: 'nowrap' }}>
        <StyledNetworkChart size={30} />
        Switch Network
      </Button>
    </>
  )
}
