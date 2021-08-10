import React, { useCallback } from 'react'
import { SUPPORTED_WALLETS } from '../../wallet/wallets'
import { Card } from '../atoms/Card'
import { ModalCell, ModalRow } from '../atoms/Modal'
import { Text2 } from '../atoms/Typography'
import { Modal } from '../molecules/Modal'

interface WalletModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const WalletModal: React.FC<WalletModalProps> = ({ closeModal, isOpen }) => {
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  return (
    <Modal
      handleClose={handleClose}
      isOpen={isOpen}
      modalTitle={'Connect a wallet to Solace'}
      disableCloseButton={false}
    >
      {SUPPORTED_WALLETS.map((wallet) => (
        <Card p={0} key={wallet.id}>
          <ModalRow>
            <ModalCell>
              <Text2>{wallet.id}</Text2>
            </ModalCell>
            <ModalCell>
              <Text2>{wallet.name}</Text2>
            </ModalCell>
          </ModalRow>
        </Card>
      ))}
    </Modal>
  )
}
