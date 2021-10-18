/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import constants
    import components
    import hooks

    NetworkConnectButton
      hooks

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

    hooks

  *************************************************************************************/
  const { openNetworkModal } = useProvider()

  return (
    <>
      <Button onClick={() => openNetworkModal()} {...props} style={{ whiteSpace: 'nowrap' }}>
        <StyledNetworkChart size={30} />
        Switch Network
      </Button>
    </>
  )
}
