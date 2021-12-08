import React, { useState, useEffect, useCallback } from 'react'
import { useNetwork } from './NetworkManager'
import { useWallet } from './WalletManager'
import { MetamaskConnector } from '../wallet/wallet-connectors/MetaMask'
import { Block } from '@ethersproject/abstract-provider'
import { Card, CardContainer } from '../components/atoms/Card'
import { ModalCell } from '../components/atoms/Modal'
import { Text } from '../components/atoms/Typography'
import { Modal } from '../components/molecules/Modal'
import { FormRow } from '../components/atoms/Form'

import { Z_MODAL } from '../constants'

import { capitalizeFirstLetter } from '../utils/formatting'
import { useGetLatestBlock } from '../hooks/useGetLatestBlock'
import { NetworkCache, SupportedProduct } from '../constants/types'
import { useCachePositions } from '../hooks/useCachePositions'

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
  latestBlock: Block | undefined
  tokenPosData: {
    batchFetching: boolean
    storedPosData: NetworkCache[]
    handleGetCache: (supportedProduct: SupportedProduct) => Promise<NetworkCache | undefined>
    getCacheForPolicies: (supportedProducts: SupportedProduct[]) => Promise<NetworkCache>
  }
}

const InitialContextValue: ProviderContextType = {
  openNetworkModal: () => undefined,
  latestBlock: undefined,
  tokenPosData: {
    batchFetching: false,
    storedPosData: [],
    handleGetCache: () => Promise.reject(),
    getCacheForPolicies: () => Promise.reject(),
  },
}

const ProviderContext = React.createContext<ProviderContextType>(InitialContextValue)

// To get access to this Manager, import this into your component or hook
export function useProvider(): ProviderContextType {
  return React.useContext(ProviderContext)
}

const ProviderManager: React.FC = ({ children }) => {
  const { networks, activeNetwork, findNetworkByChainId, findNetworkByName, changeNetwork } = useNetwork()
  const { connector } = useWallet()
  const latestBlock = useGetLatestBlock()
  const cachePositions = useCachePositions()
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

          if ((e as any).code === 4902) {
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
      latestBlock,
      tokenPosData: cachePositions,
    }),
    [openModal, latestBlock, cachePositions]
  )
  return (
    <ProviderContext.Provider value={value}>
      <Modal
        zIndex={Z_MODAL + 1}
        handleClose={closeModal}
        isOpen={networkModal}
        modalTitle={'Connect a network'}
        disableCloseButton={false}
      >
        <Card color2 p={10} mb={20}>
          <Text light textAlignCenter>
            When connected, ensure that the{' '}
          </Text>
          <Text light textAlignCenter>
            network on your wallet matches{' '}
          </Text>
          <Text light textAlignCenter>
            the network on this app.{' '}
          </Text>
        </Card>

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
              color1={network.name == activeNetwork.name}
              jc={'center'}
              style={{ display: 'flex' }}
            >
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <Text t4 bold light={network.name == activeNetwork.name}>
                    {capitalizeFirstLetter(network.name)}
                  </Text>
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
