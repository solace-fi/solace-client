import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { NoEthereumProviderError } from '@web3-react/injected-connector'

import { WalletConnector, SUPPORTED_WALLETS } from '../ethers/wallets'

import { Web3ReactProvider } from '@web3-react/core'

// helper hook for wallet balance
import getLibrary from '../utils/getLibrary'

import { ethers } from 'ethers'

export const WalletConnectors = SUPPORTED_WALLETS

export type ContextWallet = {
  initialized: boolean
  connecting?: WalletConnector
  isActive: boolean
  account?: string
  networkId?: number
  library?: any
  networkName?: string
  connector?: WalletConnector
  provider?: any
  balance?: any
  connect: (connector: WalletConnector, args?: Record<string, any>) => Promise<void>
  disconnect: () => void
  updateBalance: (b: number) => void
}

const WalletContext = createContext<ContextWallet>({
  initialized: false,
  connecting: undefined,
  isActive: false,
  account: undefined,
  networkId: undefined,
  networkName: undefined,
  connector: undefined,
  provider: undefined,
  balance: undefined,
  connect: () => Promise.reject(),
  disconnect: () => undefined,
  updateBalance: () => undefined,
})

const WalletProvider: React.FC = (props) => {
  const web3React = useWeb3React()

  const [localProvider, setLocalProvider, removeLocalProvider] = useLocalStorage<string | undefined>('wallet_provider')

  const [initialized, setInitialized] = useState<boolean>(false)
  const [connecting, setConnecting] = useState<WalletConnector | undefined>(undefined)
  const connectingRef = useRef<WalletConnector | undefined>(connecting)
  connectingRef.current = connecting
  const [activeConnector, setActiveConnector] = useState<WalletConnector | undefined>()
  const [activeProvider, setActiveProvider] = useState<any | undefined>()
  const [balance, setBalance] = useState<number | null | undefined>(undefined)

  const disconnect = useCallback(() => {
    web3React.deactivate()
    setConnecting(undefined)
    setActiveConnector(undefined)
    setActiveProvider(undefined)
    setBalance(undefined)
    removeLocalProvider()
  }, [web3React, removeLocalProvider, setConnecting])

  const updateBalance = useCallback((b) => {
    setBalance(b)
  }, [])

  const connect = useCallback(
    async (walletConnector: WalletConnector): Promise<void> => {
      if (connectingRef.current) {
        return
      }

      const connector = walletConnector.getConnector()

      connectingRef.current = walletConnector
      setConnecting(walletConnector)

      function onError(error: Error) {
        console.error('Wallet::Connect().onError', { error })

        if (error instanceof NoEthereumProviderError) {
          disconnect()
        } else if (error instanceof UnsupportedChainIdError) {
          disconnect()
        } else {
          const err = walletConnector.onError?.(error)

          console.log(err)
        }
      }

      function onSuccess() {
        if (!connectingRef.current) {
          return
        }

        connector.getProvider().then((provider) => setActiveProvider(provider))
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

      if (!!web3React.library && !!web3React.account) {
        web3React.library
          .getBalance(web3React.account)
          .then((balance: number) => {
            setBalance(balance)
          })
          .catch(() => {
            setBalance(null)
          })
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
      networkId: web3React.chainId,
      library: web3React.library ? web3React.library : new ethers.providers.JsonRpcProvider(),
      connector: activeConnector,
      provider: activeProvider,
      balance: balance,
      connect,
      disconnect,
      updateBalance,
    }),
    [web3React, initialized, connecting, activeConnector, activeProvider, balance, disconnect, connect, updateBalance]
  )

  return <WalletContext.Provider value={value}>{props.children}</WalletContext.Provider>
}

export function useWallet(): ContextWallet {
  return useContext(WalletContext)
}

const Web3Manager: React.FC = (props) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <WalletProvider>{props.children}</WalletProvider>
    </Web3ReactProvider>
  )
}

export default Web3Manager
