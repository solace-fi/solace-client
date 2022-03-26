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
import React, { useCallback, useState } from 'react'

/* import managers */
import { useWallet } from '../../../context/WalletManager'

/* import components */
import { Card, CardContainer } from '../../atoms/Card'
import { ModalCell } from '../../atoms/Modal'
import { Text } from '../../atoms/Typography'
import { Modal } from '../../molecules/Modal'
import { Flex } from '../../atoms/Layout'
import { Button, ButtonWrapper } from '../../atoms/Button'
import { Scrollable } from '../../atoms/Layout'
import { LedgerDerivationPathModal } from './LedgerDerivationPathModal'

/* import constants */
import { Z_MODAL } from '../../../constants'

/* import wallets */
import { SUPPORTED_WALLETS } from '../../../wallet/'

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
    
  hooks

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

  const isMetamask = (window as any)?.ethereum?.isMetaMask

  return (
    <Modal
      zIndex={Z_MODAL + 1}
      handleClose={handleClose}
      isOpen={isOpen}
      modalTitle={'Connect a wallet'}
      disableCloseButton={false}
    >
      <Scrollable maxMobileHeight={60}>
        <CardContainer cardsPerRow={2}>
          <Card
            canHover
            pt={5}
            pb={5}
            pl={30}
            pr={30}
            onClick={() => connectWallet(SUPPORTED_WALLETS[0].id)}
            glow={SUPPORTED_WALLETS[0].id == activeWalletConnector?.id}
            color1={SUPPORTED_WALLETS[0].id == activeWalletConnector?.id}
            jc={'center'}
            style={{ display: 'flex' }}
          >
            <Flex stretch between>
              {isMetamask && (
                <ModalCell p={10}>
                  <img src={SUPPORTED_WALLETS[0].logo} alt={SUPPORTED_WALLETS[0].name} height={32} />
                </ModalCell>
              )}
              <ModalCell p={10}>
                <Text t4 bold light={SUPPORTED_WALLETS[0].id == activeWalletConnector?.id}>
                  {isMetamask ? SUPPORTED_WALLETS[0].name : 'Browser Wallet'}
                </Text>
              </ModalCell>
            </Flex>
          </Card>
          {SUPPORTED_WALLETS.filter((w) => w.id != 'metamask').map((wallet) => (
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
              jc={'center'}
              style={{ display: 'flex' }}
            >
              <Flex stretch between>
                <ModalCell p={10}>
                  <img src={wallet.logo} alt={wallet.name} height={32} />
                </ModalCell>
                <ModalCell p={10}>
                  <Text t4 bold light={wallet.id == activeWalletConnector?.id}>
                    {wallet.name}
                  </Text>
                </ModalCell>
              </Flex>
            </Card>
          ))}
        </CardContainer>
      </Scrollable>
      {activeWalletConnector && (
        <ButtonWrapper>
          <Button widthP={100} onClick={disconnect}>
            Disconnect Wallet
          </Button>
        </ButtonWrapper>
      )}
      <LedgerDerivationPathModal
        isOpen={state.showLedgerModal}
        closeModal={() => setState({ showLedgerModal: false })}
      />
    </Modal>
  )
}
