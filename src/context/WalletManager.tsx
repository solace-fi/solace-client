import React, { useRef, useState } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { SUPPORTED_WALLETS, WalletConnector } from '../wallet'

import { useEagerConnect, useInactiveListener } from '../hooks/wallet/useWeb3'
import { WalletModal } from '../components/organisms/wallet/WalletModal'
import { useWalletModal } from '../hooks/wallet/useWalletModal'
import { useWalletHandler } from '../hooks/wallet/useWalletHandler'
import { useLocalStorage } from 'react-use-storage'

export const WalletConnectors = SUPPORTED_WALLETS

type WalletContextType = {
  activeConnector?: WalletConnector
  connect: (walletConnector: WalletConnector) => void
  disconnect: () => void
  openWalletModal: () => void
}

const WalletContext = createContext<WalletContextType>({
  activeConnector: undefined,
  connect: () => undefined,
  disconnect: () => undefined,
  openWalletModal: () => undefined,
})

const WalletManager: React.FC = (props) => {
  const [selectedProvider, setSelectedProvider, removeSelectedProvider] = useLocalStorage<string | undefined>(
    'sol_wallet_0'
  )

  const [manuallyDisconnected, setManuallyDisconnected] = useState(false)

  const { connect, disconnect } = useWalletHandler(setSelectedProvider, removeSelectedProvider, setManuallyDisconnected)

  const triedEager = useEagerConnect(connect, manuallyDisconnected, selectedProvider)
  const triedEagerRef = useRef(triedEager)
  triedEagerRef.current = triedEager

  const { showWalletModal, openModal, closeModal } = useWalletModal(triedEagerRef.current)

  useInactiveListener(triedEager && !manuallyDisconnected, connect)

  const value = useMemo<WalletContextType>(
    () => ({
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

export function useWallet(): WalletContextType {
  return useContext(WalletContext)
}

export default WalletManager
