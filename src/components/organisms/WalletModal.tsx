import React, { useCallback } from 'react'
import { SUPPORTED_WALLETS } from '../../wallet/'
import { useWallet } from '../../context/WalletManager'

import { Card, CardContainer } from '../atoms/Card'
import { ModalCell, ModalRow } from '../atoms/Modal'
import { Text2 } from '../atoms/Typography'
import { Modal } from '../molecules/Modal'

interface WalletModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const WalletModal: React.FC<WalletModalProps> = ({ closeModal, isOpen }) => {
  const { connect, connector } = useWallet()

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const connectWallet = useCallback(async (id: string) => {
    await connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === id)])
    handleClose()
  }, [])

  return (
    <Modal
      handleClose={handleClose}
      isOpen={isOpen}
      modalTitle={'Connect a wallet to Solace'}
      disableCloseButton={false}
    >
      <CardContainer cardsPerRow={2}>
        {SUPPORTED_WALLETS.map((wallet) => (
          <Card
            canHover
            p={0}
            key={wallet.id}
            onClick={() => connectWallet(wallet.id)}
            blue={wallet.id == connector?.id}
          >
            <ModalRow mb={0}>
              <ModalCell>
                <Text2>{wallet.name}</Text2>
              </ModalCell>
            </ModalRow>
          </Card>
        ))}
      </CardContainer>
    </Modal>
  )
}
