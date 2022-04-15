import React, { useCallback, useState } from 'react'
import { useWallet } from '../../context/WalletManager'
import { SUPPORTED_WALLETS } from '../../wallet'
import { Flex } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { ModalCell } from '../atoms/Modal'
import { Card, CardContainer } from '../atoms/Card'
import { LedgerDerivationPathModal } from '../organisms/wallet/LedgerDerivationPathModal'

type ConnectWalletModalState = {
  showLedgerModal: boolean
}

const InitialState: ConnectWalletModalState = {
  showLedgerModal: false,
}

export const WalletList = () => {
  const { changeWallet, activeWalletConnector } = useWallet()
  const [state, setState] = useState<ConnectWalletModalState>(InitialState)

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
    <>
      <CardContainer cardsPerRow={2} style={{ margin: 'auto' }}>
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
      <LedgerDerivationPathModal
        isOpen={state.showLedgerModal}
        closeModal={() => setState({ showLedgerModal: false })}
      />
    </>
  )
}
