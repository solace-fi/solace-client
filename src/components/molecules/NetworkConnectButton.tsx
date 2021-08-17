/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import wallets

    styled components

    WalletConnectButton function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'

/* import components */
import { Button } from '../atoms/Button'
import { StyledNetworkChart } from '../atoms/Icon'

import { GeneralElementProps } from '../generalInterfaces'
import { capitalizeFirstLetter } from '../../utils/formatting'

export const NetworkConnectButton: React.FC<GeneralElementProps> = ({ ...props }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { activeNetwork } = useNetwork()
  const { openNetworkModal } = useProvider()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <>
      <Button onClick={() => openNetworkModal()} {...props}>
        <StyledNetworkChart size={30} />
        {capitalizeFirstLetter(activeNetwork.name)}
      </Button>
    </>
  )
}
