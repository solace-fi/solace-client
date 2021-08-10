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
import React, { useState, useCallback } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Button } from '../atoms/Button'
import { WalletModal } from '../organisms/WalletModal'

/* import wallets */
import { SUPPORTED_WALLETS } from '../../wallet/wallets'

export const WalletConnectButton: React.FC = () => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { connect } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false)

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setShowWalletModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setShowWalletModal(false)
  }, [])

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <Button
      onClick={() => connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])}
    >
      Connect Wallet
    </Button>
    // <>
    //   <WalletModal closeModal={closeModal} isOpen={showWalletModal}></WalletModal>
    //   <Button onClick={() => openModal()}>Connect Wallet</Button>
    // </>
  )
}
