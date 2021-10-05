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
import React, { useCallback, useState } from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Card, CardContainer } from '../atoms/Card'
import { ModalCell } from '../atoms/Modal'
import { Heading4 } from '../atoms/Typography'
import { Modal } from '../molecules/Modal'
import { FormRow } from '../atoms/Form'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Scrollable } from '../atoms/Layout'

/* import wallets */
import { SUPPORTED_WALLETS } from '../../wallet/'
import { LedgerDerivationPathModal } from './LedgerDerivationPathModal'

interface WalletModalProps {
  closeModal: () => void
  isOpen: boolean
}

type ConnectWalletModalState = {
  showLedgerModal: boolean
}

const InitialState: ConnectWalletModalState = {
  showLedgerModal: false,
}

export const WalletModal: React.FC<WalletModalProps> = ({ closeModal, isOpen }) => {
  /************************************************************************************* 
    
  custom hooks

  *************************************************************************************/
  const { changeWallet, disconnect, activeWalletConnector } = useWallet()
  const [state, setState] = useState<ConnectWalletModalState>(InitialState)

  /************************************************************************************* 
    
  local functions

  *************************************************************************************/
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const connectWallet = useCallback(async (id: string) => {
    const foundWalletConnector = SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === id)]

    if (foundWalletConnector.id === 'ledger') {
      setState({
        showLedgerModal: true,
      })
      return
    }

    await changeWallet(foundWalletConnector)
  }, [])
  /************************************************************************************* 
    
  Render

  *************************************************************************************/
  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'Connect a wallet'} disableCloseButton={false}>
      <Scrollable maxMobileHeight={60}>
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
              color1={wallet.id == activeWalletConnector?.id}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <img src={wallet.logo} alt={wallet.name} height={32} />
                </ModalCell>
                <ModalCell p={10}>
                  <Heading4 high_em>{wallet.name}</Heading4>
                </ModalCell>
              </FormRow>
            </Card>
          ))}
        </CardContainer>
      </Scrollable>
      {activeWalletConnector && (
        <ButtonWrapper>
          <Button widthP={100} onClick={() => disconnect()}>
            Disconnect Wallet
          </Button>
        </ButtonWrapper>
      )}
      <LedgerDerivationPathModal
        isOpen={state.showLedgerModal}
        closeModal={() => {
          setState({ showLedgerModal: false })
        }}
      />
    </Modal>
  )
}
