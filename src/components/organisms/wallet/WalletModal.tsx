/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import constants
    import wallets

    WalletModal
      hooks
      local functions

  *************************************************************************************/

/* import packages */
import React, { useCallback } from 'react'

/* import managers */
import { useWallet } from '../../../context/WalletManager'

/* import components */
import { Modal } from '../../molecules/Modal'
import { Button, ButtonWrapper } from '../../atoms/Button'
import { Scrollable } from '../../atoms/Layout'

/* import constants */
import { Z_MODAL } from '../../../constants'

/* import wallets */
import { WalletList } from '../../molecules/WalletList'

interface WalletModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const WalletModal: React.FC<WalletModalProps> = ({ closeModal, isOpen }) => {
  /************************************************************************************* 
    
  hooks

  *************************************************************************************/
  const { disconnect, activeWalletConnector } = useWallet()

  /************************************************************************************* 
    
  local functions

  *************************************************************************************/
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  return (
    <Modal
      zIndex={Z_MODAL + 1}
      handleClose={handleClose}
      isOpen={isOpen}
      modalTitle={'Connect a wallet'}
      disableCloseButton={false}
    >
      <Scrollable maxMobileHeight={60}>
        <WalletList />
      </Scrollable>
      {activeWalletConnector && (
        <ButtonWrapper>
          <Button widthP={100} onClick={disconnect}>
            Disconnect Wallet
          </Button>
        </ButtonWrapper>
      )}
    </Modal>
  )
}
