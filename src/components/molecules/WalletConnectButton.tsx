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

interface WalletConnectButtonProps {
  welcome?: boolean
}

export const WalletConnectButton: React.FC<GeneralElementProps & ButtonProps & WalletConnectButtonProps> = ({
  ...props
}) => {
  /*************************************************************************************

   hooks

  *************************************************************************************/
  const { isActive, openWalletModal } = useWallet()

  return (
    <>
      {props.welcome ? (
        <Button {...props} style={{ padding: '15px 50px', borderRadius: '55px' }} onClick={openWalletModal}>
          Connect Wallet
        </Button>
      ) : (
        <Button onClick={openWalletModal} {...props}>
          <StyledWallet size={30} />
          {isActive ? 'Switch Wallet' : 'Connect Wallet'}
        </Button>
      )}
    </>
  )
}
