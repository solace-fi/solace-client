/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import wallets

    WalletModal function
      custom hooks
      local functions
      Render

  *************************************************************************************/

/* import react */
import React, { useCallback } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Card, CardContainer } from '../atoms/Card'
import { ModalCell } from '../atoms/Modal'
import { Heading3 } from '../atoms/Typography'
import { Modal } from '../molecules/Modal'
import { FormRow } from '../atoms/Form'
import { Button, ButtonWrapper } from '../atoms/Button'

/* import wallets */
import { SUPPORTED_WALLETS } from '../../wallet/'

interface WalletModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const WalletModal: React.FC<WalletModalProps> = ({ closeModal, isOpen }) => {
  /************************************************************************************* 
    
  custom hooks

  *************************************************************************************/
  const { changeWallet, disconnect, activeWalletConnector } = useWallet()
  /************************************************************************************* 
    
  local functions

  *************************************************************************************/
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const connectWallet = useCallback(async (id: string) => {
    await changeWallet(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === id)])
    handleClose()
  }, [])
  /************************************************************************************* 
    
  Render

  *************************************************************************************/
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
            glow={wallet.id == activeWalletConnector?.id}
            blue={wallet.id == activeWalletConnector?.id}
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
      {activeWalletConnector && (
        <ButtonWrapper>
          <Button widthP={100} onClick={() => disconnect()}>
            Disconnect Wallet
          </Button>
        </ButtonWrapper>
      )}
    </Modal>
  )
}
