import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react'
import { useNetwork, networks } from './NetworkManager'
import { Block } from '@ethersproject/abstract-provider'
import { Card, CardContainer } from '../components/atoms/Card'
import { ModalCell } from '../components/atoms/Modal'
import { Text } from '../components/atoms/Typography'
import { Modal } from '../components/molecules/Modal'

import { Z_MODAL } from '../constants'

import { useGetLatestBlock } from '../hooks/provider/useGetLatestBlock'
import { Scrollable } from '../components/atoms/Layout'
import { Flex } from '../components/atoms/Layout'
import ToggleSwitch from '../components/atoms/ToggleSwitch'
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { getSigner } from '../utils'

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
  provider: JsonRpcProvider
  signer?: JsonRpcSigner
  openNetworkModal: () => void
  latestBlock?: Block
}

const ProviderContext = createContext<ProviderContextType>({
  provider: new JsonRpcProvider(networks[0].rpc.httpsUrl),
  signer: undefined,
  openNetworkModal: () => undefined,
  latestBlock: undefined,
})

const ProviderManager: React.FC = (props) => {
  const { account, library } = useWeb3React()
  const { activeNetwork, changeNetwork } = useNetwork()
  const provider = useMemo(() => new JsonRpcProvider(activeNetwork.rpc.httpsUrl), [activeNetwork])
  const signer = useMemo(() => (account ? getSigner(library, account) : undefined), [library, account])
  const latestBlock = useGetLatestBlock(provider)

  const [networkModal, setNetworkModal] = useState<boolean>(false)
  const [showTestnets, setShowTestnets] = useState<boolean>(false)

  const adjustedNetworks = useMemo(() => {
    const sortedNetworks = networks.sort((a, b) => {
      return a.isTestnet === b.isTestnet ? 0 : a.isTestnet ? 1 : -1
    })
    return showTestnets ? sortedNetworks : sortedNetworks.filter((n) => !n.isTestnet)
  }, [showTestnets])

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setNetworkModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setNetworkModal(false)
  }, [])

  useEffect(() => {
    setShowTestnets(activeNetwork.isTestnet)
  }, [activeNetwork])

  const value = React.useMemo(
    () => ({
      provider,
      signer,
      openNetworkModal: openModal,
      latestBlock,
    }),
    [openModal, latestBlock, provider, signer]
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
        <Flex between itemsCenter mb={5}>
          <Flex stretch gap={7}>
            <Text t4 bold>
              Show Test Networks
            </Text>
          </Flex>
          <Flex between itemsCenter>
            <ToggleSwitch
              id="show-testnets"
              toggled={showTestnets}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowTestnets(e.target.checked)}
            />
          </Flex>
        </Flex>
        <Scrollable maxMobileHeight={60}>
          <CardContainer cardsPerRow={1}>
            {adjustedNetworks.map((network) => (
              <Card
                canHover
                pt={5}
                pb={5}
                pl={30}
                pr={30}
                key={network.name}
                onClick={() => changeNetwork(network.chainId)}
                glow={network.name == activeNetwork.name}
                color1={network.name == activeNetwork.name}
                jc={'center'}
                style={{ display: 'flex' }}
              >
                <Flex stretch between>
                  <ModalCell p={10}>
                    <Text t4 bold light={network.name == activeNetwork.name}>
                      {network.name}
                    </Text>
                  </ModalCell>
                </Flex>
              </Card>
            ))}
          </CardContainer>
        </Scrollable>
      </Modal>
      {props.children}
    </ProviderContext.Provider>
  )
}

export function useProvider(): ProviderContextType {
  return useContext(ProviderContext)
}

export default ProviderManager
