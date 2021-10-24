/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components

    WalletConnectButton
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import constants */

/* import components */
import { Button, ButtonProps } from '../atoms/Button'
import { StyledWallet } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

/* import hooks */

export const WalletConnectButton: React.FC<GeneralElementProps & ButtonProps> = ({ ...props }) => {
  /*************************************************************************************

   hooks

  *************************************************************************************/
  const { isActive, openWalletModal } = useWallet()

  return (
    <>
      <Button onClick={() => openWalletModal()} {...props}>
        <StyledWallet size={30} />
        {isActive ? 'Switch Wallet' : 'Connect Wallet'}
      </Button>
    </>
  )
}
