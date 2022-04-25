import React, { useRef } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { createContext, useCallback, useContext, useMemo } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { SUPPORTED_WALLETS2, WalletConnector } from '../wallet'
import { Error as AppError } from '../constants/enums'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { ErrorData } from '../constants/types'

import { useEagerConnect, useInactiveListener } from '../hooks/wallet/useWeb3'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useGeneral } from './GeneralManager'
import { WalletModal } from '../components/organisms/wallet/WalletModal'
import { useWalletModal } from '../hooks/wallet/useWalletModal'

export const WalletConnectors = SUPPORTED_WALLETS2

type WalletContextType = {
  activeConnector?: WalletConnector
  initialized: boolean
  connect: (walletConnector: WalletConnector) => void
  disconnect: () => void
  openWalletModal: () => void
}

const WalletContext = createContext<WalletContextType>({
  activeConnector: undefined,
  initialized: false,
  connect: () => undefined,
  disconnect: () => undefined,
  openWalletModal: () => undefined,
})

const ContextErrors = [
  AppError.NO_PROVIDER,
  AppError.UNSUPPORTED_NETWORK,
  AppError.NO_ACCESS,
  AppError.WALLET_NETWORK_UNSYNC,
  AppError.UNKNOWN_WALLET_ERROR,
]

const WalletManager: React.FC = (props) => {
  const web3React = useWeb3React()
  const { addErrors, removeErrors } = useGeneral()
  const [selectedProvider, setSelectedProvider, removeSelectedProvider] = useLocalStorage<string | undefined>(
    'sol_wallet_0'
  )

  const triedEager = useEagerConnect(selectedProvider)
  const triedEagerRef = useRef(triedEager)
  triedEagerRef.current = triedEager

  const { showWalletModal, openModal, closeModal } = useWalletModal(triedEagerRef.current)

  useInactiveListener(!triedEager)

  const connect = useCallback(
    async (walletConnector: WalletConnector) => {
      const connector = walletConnector.getConnector()

      // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
      if (connector instanceof WalletConnectConnector) {
        connector.walletConnectProvider = undefined
      }

      await web3React.activate(connector).then(onSuccess).catch(onError)

      function onSuccess() {
        removeErrors(ContextErrors)
        setSelectedProvider(walletConnector.id)
      }

      function onError(error: Error) {
        const date = Date.now()

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
    },
    [addErrors, removeErrors, setSelectedProvider, web3React]
  )

  const disconnect = useCallback(() => {
    web3React.deactivate()
    removeSelectedProvider()
  }, [removeSelectedProvider, web3React])

  const value = useMemo<WalletContextType>(
    () => ({
      initialized: triedEagerRef.current,
      connect,
      disconnect,
      openWalletModal: openModal,
    }),
    [connect, disconnect, openModal]
  )

  return (
    <WalletContext.Provider value={value}>
      <WalletModal closeModal={closeModal} isOpen={showWalletModal} />
      {props.children}
    </WalletContext.Provider>
  )
}

export function useWallet2(): WalletContextType {
  return useContext(WalletContext)
}

export default WalletManager
