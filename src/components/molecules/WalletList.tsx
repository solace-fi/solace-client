import React, { useCallback } from 'react'
import { useWallet } from '../../context/WalletManager'
import { SUPPORTED_WALLETS } from '../../wallet'
import { Flex } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { ModalCell } from '../atoms/Modal'
import { Card, CardContainer } from '../atoms/Card'
import { useWeb3React } from '@web3-react/core'

export const WalletList = () => {
  const { connector } = useWeb3React()
  const { connect } = useWallet()

  const connectWallet = useCallback(
    async (id: string) => {
      const foundWalletConnector = SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === id)]

      await connect(foundWalletConnector)
    },
    [connect]
  )

  // const isMetamask = (window as any)?.ethereum?.isMetaMask
  return (
    <>
      <CardContainer cardsPerRow={1} style={{ margin: 'auto' }}>
        <Card
          canHover
          pt={5}
          pb={5}
          pl={30}
          pr={30}
          onClick={() => connectWallet(SUPPORTED_WALLETS[0].id)}
          glow={SUPPORTED_WALLETS[0].connector === connector}
          color1={SUPPORTED_WALLETS[0].connector === connector}
          jc={'center'}
          style={{ display: 'flex' }}
        >
          <Flex stretch between>
            <ModalCell p={10}>
              <img src={SUPPORTED_WALLETS[0].logo} alt={SUPPORTED_WALLETS[0].name} height={32} />
            </ModalCell>
            <ModalCell p={10}>
              <Text t4 bold light={SUPPORTED_WALLETS[0].connector === connector}>
                Browser Wallet
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
            glow={wallet.connector === connector}
            color1={wallet.connector === connector}
            jc={'center'}
            style={{ display: 'flex' }}
          >
            <Flex stretch between>
              <ModalCell p={10}>
                <img src={wallet.logo} alt={wallet.name} height={32} />
              </ModalCell>
              <ModalCell p={10}>
                <Text t4 bold light={wallet.connector === connector}>
                  {wallet.name}
                </Text>
              </ModalCell>
            </Flex>
          </Card>
        ))}
      </CardContainer>
    </>
  )
}
