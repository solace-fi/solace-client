import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { WalletConnector, SUPPORTED_WALLETS } from '../wallet/wallets'

import { Web3ReactProvider } from '@web3-react/core'

import getLibrary from '../utils/getLibrary'
import { useReload } from '../hooks/useReload'
import { useProvider } from './ProviderManager'
import { useFetchGasPrice } from '../hooks/useFetchGasPrice'
import { Error as AppError } from '../constants/enums'
import { useUserData } from './UserDataManager'
import { getTokens } from '../utils/positionGetters/aave/getTokens'

/*

This Manager keeps track of the user's wallet and details, including the wallet type, account, 
and the network id, as well as provide the functions to connect and disconnect the wallet.

Please note that some of this code was ported over from the Barnbridge frontend so there could 
be some incoherent code here and there.

SUPPORTED_WALLETS contains connectors that the application allows, if the user's connected wallet is included,
the connect function is called.

The user's selected wallet connector is then stored into local storage so when they come into the web app again,
the connection will be automatic.

Currently, the reload and dataReload features take place in this manager as well. These features are called and
read by components and hooks across the app to stay in sync with each other. The main difference is that reload
should be called manually, such as when the user sends a transaction, and dataReload is called on an interval and
updates the app at a fixed rate with the user's input.

*/

export const WalletConnectors = SUPPORTED_WALLETS

export type ContextWallet = {
  initialized: boolean
  connecting?: WalletConnector
  isActive: boolean
  account?: string
  chainId?: number
  library?: any
  connector?: WalletConnector
  version?: number
  dataVersion?: any
  gasPrices?: any
  errors: AppError[]
  connect: (connector: WalletConnector, args?: Record<string, any>) => Promise<void>
  disconnect: () => void
  reload: () => void
  dataReload: () => void
}

const WalletContext = createContext<ContextWallet>({
  initialized: false,
  connecting: undefined,
  isActive: false,
  account: undefined,
  chainId: undefined,
  library: undefined,
  connector: undefined,
  version: undefined,
  dataVersion: undefined,
  gasPrices: undefined,
  errors: [],
  connect: () => Promise.reject(),
  disconnect: () => undefined,
  reload: () => undefined,
  dataReload: () => undefined,
})

const WalletProvider: React.FC = (props) => {
  const web3React = useWeb3React()
  const { removeLocalTransactions } = useUserData()
  const [localProvider, setLocalProvider, removeLocalProvider] = useLocalStorage<string | undefined>('wallet_provider')
  const gasPrices = useFetchGasPrice()
  const [activeConnector, setActiveConnector] = useState<WalletConnector | undefined>()
  const [connecting, setConnecting] = useState<WalletConnector | undefined>(undefined)
  const [initialized, setInitialized] = useState<boolean>(false)
  const [reload, version] = useReload()
  const [dataReload, dataVersion] = useReload()
  const connectingRef = useRef<WalletConnector | undefined>(connecting)
  connectingRef.current = connecting
  const [errors, setErrors] = useState<AppError[]>([])

  const provider = useProvider()

  const disconnect = useCallback(() => {
    web3React.deactivate()
    setConnecting(undefined)
    setActiveConnector(undefined)
    removeLocalProvider()
    removeLocalTransactions()
  }, [web3React, removeLocalProvider, setConnecting])

  const connect = useCallback(
    async (walletConnector: WalletConnector): Promise<void> => {
      // if a connector is trying to connect, do not try to connect again
      if (connectingRef.current) {
        return
      }

      const connector = walletConnector.connector.getConnector()
      connectingRef.current = walletConnector
      setConnecting(walletConnector)
      const walletErrors: AppError[] = []

      function onError(error: Error) {
        if (error instanceof NoEthereumProviderError) {
          walletErrors.push(AppError.NO_ETH_PROVIDER)
        } else if (error instanceof UnsupportedChainIdError) {
          walletErrors.push(AppError.UNSUPPORTED_NETWORK)
        } else if (
          error instanceof UserRejectedRequestErrorInjected ||
          error instanceof UserRejectedRequestErrorWalletConnect
        ) {
          walletErrors.push(AppError.NO_ACCESS)
        } else {
          const err = walletConnector.connector.onError?.(error)
          walletErrors.push(AppError.UNKNOWN)
          console.log(err)
        }
        setErrors(walletErrors)
      }

      function onSuccess() {
        setErrors([])
        if (!connectingRef.current) {
          return
        }
        setActiveConnector(walletConnector)
        setLocalProvider(walletConnector.id)
      }

      await web3React.activate(connector, undefined, true).then(onSuccess).catch(onError)

      setConnecting(undefined)
    },
    [web3React, connectingRef, setConnecting, setLocalProvider, disconnect]
  )

  useEffect(() => {
    // If the user has a local provider already
    ;(async () => {
      if (localProvider) {
        const walletConnector = WalletConnectors.find((c) => c.id === localProvider)

        if (walletConnector) {
          await connect(walletConnector)
        }
      }

      setInitialized(true)
    })()
  }, [web3React])

  // dataReload is called on an interval
  useEffect(() => {
    const dataInterval = setInterval(() => dataReload(), 3500)
    return () => {
      clearInterval(dataInterval)
    }
  }, [])

  const value = useMemo<ContextWallet>(
    () => ({
      initialized,
      connecting,
      isActive: web3React.active,
      account: web3React.account ?? undefined,
      chainId: web3React.chainId,
      library: web3React.account ? web3React.library : provider.ethProvider,
      connector: activeConnector,
      version,
      dataVersion,
      gasPrices,
      errors,
      connect,
      disconnect,
      reload,
      dataReload,
    }),
    [web3React, provider, initialized, connecting, activeConnector, version, errors, disconnect, connect]
  )

  return <WalletContext.Provider value={value}>{props.children}</WalletContext.Provider>
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
