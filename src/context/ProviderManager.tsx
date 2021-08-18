import React, { useState, useEffect, useCallback } from 'react'
import { useNetwork } from './NetworkManager'
import { useWallet } from './WalletManager'
import { MetamaskConnector } from '../wallet/wallets/MetaMask'

import { Card, CardContainer } from '../components/atoms/Card'
import { ModalCell } from '../components/atoms/Modal'
import { Heading3 } from '../components/atoms/Typography'
import { Modal } from '../components/molecules/Modal'
import { FormRow } from '../components/atoms/Form'
import { capitalizeFirstLetter } from '../utils/formatting'

// import { getTokens } from '../utils/positionGetters/yearn/getTokens'

/*

This Manager initializes the Web3 provider and the JSON-RPC provider.

These two providers utilize the ethers library, which makes a strong distinction between
Providers and Signers. The Provider is a read-only abstraction to access blockchain data, while 
Signer is an abstraction that allows for executing state-changing operations.

Please refer to the Ethers documentation for more details.

The reason why two providers are employed at the moment is anchored on
whether the user connected their wallet. If they didn't, we use the JsonRpcProvider that taps into 
Alchemy to retrieve data, else, we use Web3Provider that can retrieve data, interact with the user's wallet, 
and write to the blockchain.

*/

type ProviderContextType = {
  openNetworkModal: () => void
}

const InitialContextValue: ProviderContextType = {
  openNetworkModal: () => undefined,
}

const ProviderContext = React.createContext<ProviderContextType>(InitialContextValue)

// To get access to this Manager, import this into your component or hook
export function useProvider(): ProviderContextType {
  return React.useContext(ProviderContext)
}

const ProviderManager: React.FC = ({ children }) => {
  const { networks, activeNetwork, findNetworkByChainId, findNetworkByName, changeNetwork } = useNetwork()
  const { connector } = useWallet()

  const [networkModal, setNetworkModal] = useState<boolean>(false)

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setNetworkModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setNetworkModal(false)
  }, [])

  useEffect(() => {
    if (connector instanceof MetamaskConnector) {
      connector.getProvider().then((provider) => {
        provider.on('chainChanged', (chainId: number) => {
          const network = findNetworkByChainId(Number(chainId)) ?? networks[0]
          changeNetwork(network.name, connector)
        })
      })
    }
  }, [connector, changeNetwork, findNetworkByChainId])

  const switchNetwork = useCallback(
    async (networkName: string) => {
      const network = findNetworkByName(networkName)

      if (!network) {
        return
      }

      let canSetNetwork = true
      if (connector instanceof MetamaskConnector && network.metamaskChain) {
        try {
          const error = await connector.switchChain({
            chainId: network.metamaskChain.chainId,
          })

          if (error) {
            canSetNetwork = false
          }
        } catch (e) {
          canSetNetwork = false

          if (e.code === 4902) {
            await connector.addChain(network.metamaskChain)
          }
        }
      }

      if (canSetNetwork) {
        changeNetwork(network.name, connector)
      }
      closeModal()
    },
    [connector]
  )

  const value = React.useMemo(
    () => ({
      openNetworkModal: openModal,
    }),
    [openModal]
  )
  return (
    <ProviderContext.Provider value={value}>
      <Modal handleClose={closeModal} isOpen={networkModal} modalTitle={'Connect a network'} disableCloseButton={false}>
        <CardContainer cardsPerRow={1}>
          {networks.map((network) => (
            <Card
              canHover
              pt={5}
              pb={5}
              pl={80}
              pr={80}
              key={network.name}
              onClick={() => switchNetwork(network.name)}
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
      {children}
    </ProviderContext.Provider>
  )
}

export default ProviderManager
