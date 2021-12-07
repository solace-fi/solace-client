import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { WalletConnector, SUPPORTED_WALLETS } from '../wallet'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3ReactProvider } from '@web3-react/core'
import { JsonRpcProvider } from '@ethersproject/providers'
import getLibrary from '../utils/getLibrary'
import { Error as AppError } from '../constants/enums'
import { ErrorData } from '../constants/types'
import { WalletModal } from '../components/organisms/wallet/WalletModal'
import { useNetwork } from './NetworkManager'
import { MetamaskConnector } from '../wallet/wallet-connectors/MetaMask'
import { useGeneral } from './GeneralProvider'
/*

This Manager keeps track of the user's wallet and details, including the wallet type and account, 
as well as provide the functions to connect and disconnect the wallet.

SUPPORTED_WALLETS contains connectors that the application allows, if the user's connected wallet is included,
the connect function is called.

The user's selected wallet connector is then stored into storage so when they come into the web app again,
the connection will be automatic.

*/

export const WalletConnectors = SUPPORTED_WALLETS

export type ContextWallet = {
  initialized: boolean
  connecting?: WalletConnector
  isActive: boolean
  account?: string
  name?: string
  library?: any
  connector?: AbstractConnector
  activeWalletConnector?: WalletConnector
  openWalletModal: () => void
  changeWallet: (walletConnector: WalletConnector) => void
  connect: (connector: WalletConnector, args?: Record<string, any>) => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<ContextWallet>({
  initialized: false,
  connecting: undefined,
  isActive: false,
  account: undefined,
  name: undefined,
  library: undefined,
  connector: undefined,
  activeWalletConnector: undefined,
  openWalletModal: () => undefined,
  changeWallet: () => undefined,
  connect: () => Promise.reject(),
  disconnect: () => undefined,
})

const WalletProvider: React.FC = (props) => {
  const web3React = useWeb3React()
  const { activeNetwork } = useNetwork()
  const [selectedProvider, setSelectedProvider, removeSelectedProvider] = useLocalStorage<string | undefined>(
    'sol_wallet_0'
  )
  const [activeConnector, setActiveConnector] = useState<WalletConnector | undefined>()
  const [connecting, setConnecting] = useState<WalletConnector | undefined>(undefined)
  const [initialized, setInitialized] = useState<boolean>(false)
  const connectingRef = useRef<WalletConnector | undefined>(connecting)
  connectingRef.current = connecting
  const [walletModal, setWalletModal] = useState<boolean>(false)
  const { addErrors, removeErrors } = useGeneral()
  const [name, setName] = useState<string | undefined>(undefined)
  const ethProvider = useMemo(() => new JsonRpcProvider(activeNetwork.rpc.httpsUrl), [activeNetwork])

  const date = Date.now()
  const ContextErrors = [
    AppError.NO_PROVIDER,
    AppError.UNSUPPORTED_NETWORK,
    AppError.NO_ACCESS,
    AppError.WALLET_NETWORK_UNSYNC,
    AppError.UNKNOWN_WALLET_ERROR,
  ]

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setWalletModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setWalletModal(false)
  }, [])

  const changeWallet = useCallback((walletConnector: WalletConnector) => {
    // there were cases where changing wallets without changing the network does not pull data correctly in that network
    setSelectedProvider(walletConnector.id)
    window.location.reload()
  }, [])

  const disconnect = useCallback(() => {
    web3React.deactivate()
    setConnecting(undefined)
    setActiveConnector(undefined)
    removeSelectedProvider()
  }, [web3React, removeSelectedProvider, setConnecting])

  const connect = useCallback(
    async (walletConnector: WalletConnector, args?: Record<string, any>): Promise<void> => {
      // if a connector is trying to connect, do not try to connect again
      if (connectingRef.current) return

      connectingRef.current = walletConnector
      setConnecting(walletConnector)
      const connector = walletConnector.getConnector(activeNetwork, args)

      // when connecting via metamask, if app not initialized yet,
      // set wallet network to app network before activation
      if (connector instanceof MetamaskConnector && activeNetwork.metamaskChain && !initialized) {
        try {
          await connector.switchChain({
            chainId: activeNetwork.metamaskChain.chainId,
          })
        } catch (e) {
          if (e.code === 4902) {
            await connector.addChain(activeNetwork.metamaskChain)
          }
        }
      }

      await web3React.activate(connector, undefined, true).then(onSuccess).catch(onError)

      function onSuccess() {
        if (!connectingRef.current) return
        removeErrors(ContextErrors)
        walletConnector.onConnect?.(connector, args)
        setActiveConnector(walletConnector)
        setSelectedProvider(walletConnector.id)
      }

      function onError(error: Error) {
        const walletErrors: ErrorData[] = []
        if (error instanceof NoEthereumProviderError) {
          walletErrors.push({ type: AppError.NO_PROVIDER, metadata: 'n/a', uniqueId: `${AppError.NO_PROVIDER}` })
        } else if (error instanceof UnsupportedChainIdError) {
          walletErrors.push({ type: AppError.UNSUPPORTED_NETWORK, metadata: `not supported`, uniqueId: `${date}` })
        } else if (
          error instanceof UserRejectedRequestErrorInjected ||
          error instanceof UserRejectedRequestErrorWalletConnect
        ) {
          walletErrors.push({ type: AppError.NO_ACCESS, metadata: `no access`, uniqueId: `${date}` })
        } else {
          const err = walletConnector.onError?.(error)
          walletErrors.push({ type: AppError.UNKNOWN_WALLET_ERROR, metadata: `${String(err)}`, uniqueId: `${date}` })
          console.log(err)
        }
        addErrors(walletErrors)
      }

      setConnecting(undefined)
    },
    [web3React, activeNetwork, connectingRef, setConnecting, setSelectedProvider, addErrors]
  )

  useEffect(() => {
    if (
      selectedProvider == 'metamask' &&
      web3React.chainId &&
      activeNetwork.chainId &&
      web3React.chainId !== activeNetwork.chainId &&
      connecting
    ) {
      addErrors([
        {
          type: AppError.WALLET_NETWORK_UNSYNC,
          metadata: `not matching to chain ${activeNetwork.chainId}`,
          uniqueId: `${date}`,
        },
      ])
    }
  }, [activeNetwork, web3React, selectedProvider, connecting])

  useEffect(() => {
    // If the user has a local provider already
    ;(async () => {
      if (selectedProvider) {
        const walletConnector = WalletConnectors.find((c) => c.id === selectedProvider)
        if (walletConnector) await connect(walletConnector)
      }
      setInitialized(true)
    })()
  }, [web3React])

  useEffect(() => {
    if (!web3React.account || !web3React.library) return
    const checkForENS = async () => {
      const network = await web3React.library.getNetwork()
      if (!network.ensAddress) return
      const name = await web3React.library.lookupAddress(web3React.account)
      if (!name) return
      const address = await web3React.library.resolveName(name)
      if (!address) return
      if (address == web3React.account) setName(name)
    }
    checkForENS()
  }, [web3React.account, web3React.library])

  const value = useMemo<ContextWallet>(
    () => ({
      initialized,
      connecting,
      isActive: web3React.active,
      account: web3React.account ?? undefined,
      name,
      library: web3React.account ? web3React.library : ethProvider,
      connector: web3React.connector,
      activeWalletConnector: activeConnector,
      openWalletModal: openModal,
      changeWallet,
      connect,
      disconnect,
    }),
    [web3React, ethProvider, initialized, activeConnector, connecting, disconnect, connect]
  )

  return (
    <WalletContext.Provider value={value}>
      <WalletModal closeModal={closeModal} isOpen={walletModal} />
      {props.children}
    </WalletContext.Provider>
  )
}

// To get access to this Manager, import this into your component or hook
export function useWallet(): ContextWallet {
  return useContext(WalletContext)
}

const WalletManager: React.FC = (props) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <WalletProvider>{props.children}</WalletProvider>
    </Web3ReactProvider>
  )
}

export default WalletManager
