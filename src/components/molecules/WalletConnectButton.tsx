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
import { useWeb3React } from '@web3-react/core'
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
  const { openWalletModal } = useWallet()
  const { active } = useWeb3React()

  return (
    <>
      {props.welcome ? (
        <Button {...props} style={{ padding: '15px 50px', borderRadius: '55px' }} onClick={openWalletModal}>
          Connect Wallet
        </Button>
      ) : (
        <Button onClick={openWalletModal} {...props}>
          <StyledWallet size={30} />
          {active ? 'Switch Wallet' : 'Connect Wallet'}
        </Button>
      )}
    </>
  )
}
