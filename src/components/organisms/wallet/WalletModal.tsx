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
import React, { useCallback, useEffect } from 'react'

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
import { useWeb3React } from '@web3-react/core'
import usePrevious from '../../../hooks/internal/usePrevious'

interface WalletModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const WalletModal: React.FC<WalletModalProps> = ({ closeModal, isOpen }) => {
  /************************************************************************************* 
    
  hooks

  *************************************************************************************/
  const { connector, active, error, account } = useWeb3React()
  const { disconnect } = useWallet()

  /************************************************************************************* 
    
  local functions

  *************************************************************************************/
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)

  // if the user is inactive, then became active
  // or if the connector is different, close modal
  useEffect(() => {
    if ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error)) {
      handleClose()
    }
  }, [active, activePrevious, handleClose, connector, connectorPrevious, error])

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
      {account && (
        <ButtonWrapper>
          <Button widthP={100} onClick={disconnect}>
            Disconnect Wallet
          </Button>
        </ButtonWrapper>
      )}
    </Modal>
  )
}
