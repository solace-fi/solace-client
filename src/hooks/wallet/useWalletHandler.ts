import { useGeneral } from '../../context/GeneralManager'
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from '@web3-react/walletconnect-connector'
import { ErrorData } from '../../constants/types'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { Error as AppError } from '../../constants/enums'
import { useCallback } from 'react'
import { WalletConnector } from '../../wallet'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

const ContextErrors = [
  AppError.NO_PROVIDER,
  AppError.UNSUPPORTED_NETWORK,
  AppError.NO_ACCESS,
  AppError.WALLET_NETWORK_UNSYNC,
  AppError.UNKNOWN_WALLET_ERROR,
]

export const useWalletHandler = (
  setSelectedProvider: (value: string | undefined) => void,
  removeSelectedProvider: () => void,
  setManuallyDisconnected: (value: boolean) => void
): {
  connect: (walletConnector: WalletConnector) => Promise<void>
  disconnect: () => void
} => {
  const { setRightSidebar, addErrors, removeErrors } = useGeneral()
  const { connector, activate, deactivate } = useWeb3React()

  const connect = useCallback(
    async (walletConnector: WalletConnector) => {
      const connector = walletConnector.connector

      // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
      if (connector instanceof WalletConnectConnector) {
        connector.walletConnectProvider = undefined
      }

      await activate(connector, undefined, true).then(onSuccess).catch(onError)

      function onSuccess() {
        removeErrors(ContextErrors)
        setSelectedProvider(walletConnector.id)
        setManuallyDisconnected(false)
        setRightSidebar(false)
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
          walletErrors.push({ type: AppError.UNKNOWN_WALLET_ERROR, metadata: `${String(error)}`, uniqueId: `${date}` })
          console.log(error)
        }
        addErrors(walletErrors)
      }
    },
    [removeErrors, setSelectedProvider, activate, addErrors]
  )

  const disconnect = useCallback(() => {
    deactivate()
    if (connector instanceof WalletConnectConnector || connector instanceof WalletLinkConnector) {
      connector?.close()
    }
    setManuallyDisconnected(true)
    removeSelectedProvider()
  }, [removeSelectedProvider, deactivate, connector])

  return { connect, disconnect }
}
