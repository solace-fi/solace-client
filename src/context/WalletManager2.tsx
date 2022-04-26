import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { WalletConnector2, SUPPORTED_WALLETS2 } from '../wallet'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Error as AppError } from '../constants/enums'
import { ErrorData } from '../constants/types'
import { WalletModal } from '../components/organisms/wallet/WalletModal'
import { useNetwork2 } from './NetworkManager2'
import { MetamaskConnector } from '../wallet/wallet-connectors/MetaMask'
import { useGeneral } from './GeneralManager'
import { useWalletModal } from '../hooks/wallet/useWalletModal'
import { useENS } from '../hooks/wallet/useENS'

/*

This Manager keeps track of the user's wallet and details, including the wallet type and account, 
as well as provide the functions to connect and disconnect the wallet.

SUPPORTED_WALLETS2 contains connectors that the application allows, if the user's connected wallet is included,
the connect function is called.

The user's selected wallet connector is then stored into storage so when they come into the web app again,
the connection will be automatic.

*/

export type ContextWallet = {
  initialized: boolean
  connecting?: WalletConnector2
  isActive: boolean
  account?: string
  name?: string
  library?: any
  connector?: AbstractConnector
  activeWalletConnector?: WalletConnector2
  openWalletModal: () => void
  changeWallet: (walletConnector: WalletConnector2) => void
  connect: (connector: WalletConnector2, args?: Record<string, any>) => Promise<void>
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
  const { activeNetwork } = useNetwork2()
  const [selectedProvider, setSelectedProvider, removeSelectedProvider] = useLocalStorage<string | undefined>(
    'sol_wallet_0'
  )
  const [activeConnector, setActiveConnector] = useState<WalletConnector2 | undefined>()
  const [connecting, setConnecting] = useState<WalletConnector2 | undefined>(undefined)
  const [initialized, setInitialized] = useState<boolean>(false)
  const connectingRef = useRef<WalletConnector2 | undefined>(connecting)
  connectingRef.current = connecting
  const { addErrors, removeErrors } = useGeneral()
  const name = useENS()
  const ethProvider = useMemo(() => new JsonRpcProvider(activeNetwork.rpc.httpsUrl), [activeNetwork])
  const accountRef = useRef(web3React.account)
  const initializedRef = useRef(initialized)
  accountRef.current = web3React.account
  initializedRef.current = initialized
  const { showWalletModal, openModal, closeModal } = useWalletModal(initializedRef.current)

  const date = Date.now()
  const ContextErrors = [
    AppError.NO_PROVIDER,
    AppError.UNSUPPORTED_NETWORK,
    AppError.NO_ACCESS,
    AppError.WALLET_NETWORK_UNSYNC,
    AppError.UNKNOWN_WALLET_ERROR,
  ]

  const changeWallet = useCallback((walletConnector: WalletConnector2) => {
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
    async (walletConnector: WalletConnector2, args?: Record<string, any>): Promise<void> => {
      // if a connector is trying to connect, do not try to connect again
      if (connectingRef.current) return

      connectingRef.current = walletConnector
      setConnecting(walletConnector)
      const connector = walletConnector.getConnector()

      // when connecting via metamask, if app not initialized yet,
      // set wallet network to app network before activation
      if (connector instanceof MetamaskConnector && activeNetwork.metamaskChain && !initialized) {
        try {
          await connector.switchChain({
            chainId: activeNetwork.metamaskChain.chainId,
          })
        } catch (e) {
          if ((e as any).code === 4902) {
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
        const walletConnector = SUPPORTED_WALLETS2.find((c) => c.id === selectedProvider)
        if (walletConnector) await connect(walletConnector).then(() => setInitialized(true))
      } else {
        setInitialized(true)
      }
    })()
  }, [web3React])

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
      <WalletModal closeModal={closeModal} isOpen={showWalletModal} />
      {props.children}
    </WalletContext.Provider>
  )
}

// To get access to this Manager, import this into your component or hook
export function useWallet2(): ContextWallet {
  return useContext(WalletContext)
}

const WalletManager: React.FC = (props) => {
  return <WalletProvider>{props.children}</WalletProvider>
}

export default WalletManager
