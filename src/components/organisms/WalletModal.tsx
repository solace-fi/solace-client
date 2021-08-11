import React, { useCallback } from 'react'
import { SUPPORTED_WALLETS } from '../../wallet/'
import { useWallet } from '../../context/WalletManager'

import { Card, CardContainer } from '../atoms/Card'
import { ModalCell, ModalRow } from '../atoms/Modal'
import { Text2, Text3, Heading3 } from '../atoms/Typography'
import { Modal } from '../molecules/Modal'
import { FormRow } from '../atoms/Form'

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
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'Connect a wallet'} disableCloseButton={false}>
      <CardContainer cardsPerRow={2}>
        {SUPPORTED_WALLETS.map((wallet) => (
          <Card
            canHover
            pt={5}
            pb={5}
            pl={30}
            pr={30}
            key={wallet.id}
            onClick={() => connectWallet(wallet.id)}
            glow={wallet.id == connector?.id}
            blue={wallet.id == connector?.id}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <FormRow mb={0}>
              <ModalCell p={10}>
                <img src={wallet.logo} alt={wallet.name} height={32} />
              </ModalCell>
              <ModalCell p={10}>
                <Heading3>{wallet.name}</Heading3>
              </ModalCell>
            </FormRow>
          </Card>
        ))}
      </CardContainer>
    </Modal>
  )
}
