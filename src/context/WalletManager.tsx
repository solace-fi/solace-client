import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage, useSessionStorage } from 'react-use-storage'
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
import { WalletModal } from '../components/organisms/WalletModal'
import { useNetwork } from './NetworkManager'
import { MetamaskConnector } from '../wallet/wallets/MetaMask'
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
  library?: any
  connector?: AbstractConnector
  activeWalletConnector?: WalletConnector
  errors: AppError[]
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
  library: undefined,
  connector: undefined,
  errors: [],
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
  const [errors, setErrors] = useState<AppError[]>([])
  const [walletModal, setWalletModal] = useState<boolean>(false)

  const ethProvider = useMemo(() => new JsonRpcProvider(activeNetwork.rpc.httpsUrl), [activeNetwork])

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setWalletModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setWalletModal(false)
  }, [])

  const changeWallet = useCallback((walletConnector: WalletConnector) => {
    // there were cases where changing wallets without changing the network does not give the correct balance in that network
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
    async (walletConnector: WalletConnector): Promise<void> => {
      // if a connector is trying to connect, do not try to connect again
      if (connectingRef.current) return

      connectingRef.current = walletConnector
      setConnecting(walletConnector)
      const connector = walletConnector.getConnector(activeNetwork)

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

      await web3React.activate(connector, undefined, true).then(onSuccess).catch(onError).then(closeModal)

      function onSuccess() {
        if (!connectingRef.current) return
        setErrors([])
        walletConnector.onConnect?.(connector)
        setActiveConnector(walletConnector)
        setSelectedProvider(walletConnector.id)
      }

      function onError(error: Error) {
        const walletErrors: AppError[] = []
        if (error instanceof NoEthereumProviderError) {
          walletErrors.push(AppError.NO_PROVIDER)
        } else if (error instanceof UnsupportedChainIdError) {
          walletErrors.push(AppError.UNSUPPORTED_NETWORK)
        } else if (
          error instanceof UserRejectedRequestErrorInjected ||
          error instanceof UserRejectedRequestErrorWalletConnect
        ) {
          walletErrors.push(AppError.NO_ACCESS)
        } else {
          const err = walletConnector.onError?.(error)
          walletErrors.push(AppError.UNKNOWN)
          console.log(err)
        }
        setErrors(walletErrors)
      }

      setConnecting(undefined)
    },
    [web3React, activeNetwork, connectingRef, setConnecting, setSelectedProvider]
  )

  useEffect(() => {
    if (
      selectedProvider == 'metamask' &&
      web3React.chainId &&
      activeNetwork.chainId &&
      web3React.chainId !== activeNetwork.chainId &&
      connecting
    ) {
      if (!errors.includes(AppError.WALLET_NETWORK_UNSYNC))
        setErrors((errors) => [...errors, AppError.WALLET_NETWORK_UNSYNC])
    }
  }, [activeNetwork, errors, web3React, selectedProvider, connecting])

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

  const value = useMemo<ContextWallet>(
    () => ({
      initialized,
      connecting,
      isActive: web3React.active,
      account: web3React.account ?? undefined,
      library: web3React.account ? web3React.library : ethProvider,
      connector: web3React.connector,
      activeWalletConnector: activeConnector,
      errors,
      openWalletModal: openModal,
      changeWallet,
      connect,
      disconnect,
    }),
    [web3React, ethProvider, initialized, activeConnector, connecting, errors, disconnect, connect]
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
