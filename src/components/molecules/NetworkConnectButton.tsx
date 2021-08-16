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
import React, { useCallback } from 'react'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Button } from '../atoms/Button'
import { StyledNetworkChart } from '../atoms/Icon'

import { GeneralElementProps } from '../generalInterfaces'
import { capitalizeFirstLetter } from '../../utils/formatting'

export const NetworkConnectButton: React.FC<GeneralElementProps> = ({ ...props }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { isActive } = useWallet()
  const { activeNetwork, openNetworkModal } = useNetwork()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <>
      <Button onClick={() => openNetworkModal()} {...props}>
        <StyledNetworkChart size={30} />
        {isActive && `${capitalizeFirstLetter(activeNetwork.name)}`}
      </Button>
    </>
  )
}
