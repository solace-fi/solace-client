import React, { useCallback } from 'react'
import { SUPPORTED_WALLETS } from '../../wallet/'
import { useWallet } from '../../context/WalletManager'

import { Card, CardContainer } from '../atoms/Card'
import { ModalCell, ModalRow } from '../atoms/Modal'
import { Heading3 } from '../atoms/Typography'
import { Modal } from '../molecules/Modal'
import { FormRow } from '../atoms/Form'
import { useNetwork } from '../../context/NetworkManager'
import { capitalizeFirstLetter } from '../../utils/formatting'

interface NetworkModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const NetworkModal: React.FC<NetworkModalProps> = ({ closeModal, isOpen }) => {
  const { activeNetwork, networks, switchNetwork } = useNetwork()

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const switchNet = useCallback(async (name: string) => {
    await switchNetwork(networks[networks.findIndex((network) => network.name === name)].name)
    handleClose()
  }, [])

  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'Connect a network'} disableCloseButton={false}>
      <CardContainer cardsPerRow={1}>
        {networks.map((network) => (
          <Card
            canHover
            pt={5}
            pb={5}
            pl={80}
            pr={80}
            key={network.name}
            onClick={() => switchNet(network.name)}
            glow={network.name == activeNetwork.name}
            blue={network.name == activeNetwork.name}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <FormRow mb={0}>
              <ModalCell p={10}>
                <Heading3>{capitalizeFirstLetter(network.name)}</Heading3>
              </ModalCell>
            </FormRow>
          </Card>
        ))}
      </CardContainer>
    </Modal>
  )
}
