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
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Button } from '../atoms/Button'

/* import wallets */
import { SUPPORTED_WALLETS } from '../../wallet/wallets'

export const WalletConnectButton: React.FC = () => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { connect } = useWallet()

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <Button
      onClick={() => connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])}
    >
      Connect Wallet
    </Button>
  )
}
