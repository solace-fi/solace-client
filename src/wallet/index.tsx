import { AbstractConnector } from '@web3-react/abstract-connector'
import { NetworkConfig } from '../constants/types'
import { MetaMaskConnector, MetaMaskConnector2 } from './wallet-connectors/MetaMask'
import { WalletConnectConnector, WalletConnectConnector2 } from './wallet-connectors/WalletConnect'
import { WalletLinkConnector, WalletLinkConnector2 } from './wallet-connectors/WalletLink'
import { FortmaticConnector } from './wallet-connectors/Fortmatic'
import { AuthereumConnector } from './wallet-connectors/Authereum'
import { TorusConnector } from './wallet-connectors/Torus'
import { PortisConnector } from './wallet-connectors/Portis'
import { TrezorConnector } from './wallet-connectors/Trezor'
import { LedgerConnector } from './wallet-connectors/Ledger'

export interface WalletConnector {
  name: string
  id: string
  logo: string
  supportedTxTypes: number[]
  getConnector(): AbstractConnector
  onConnect?(connector: AbstractConnector, args?: Record<string, any>): void
  onDisconnect?(connector?: AbstractConnector): void
  onError(error: Error): Error | undefined
}

export interface WalletConnector2 {
  name: string
  id: string
  logo: string
  supportedTxTypes: number[]
  connector: AbstractConnector
}

export const SUPPORTED_WALLETS: WalletConnector[] = [
  MetaMaskConnector,
  WalletConnectConnector,
  WalletLinkConnector,
  // FortmaticConnector,
  // AuthereumConnector,
  // TorusConnector,
  // PortisConnector,
  // TrezorConnector,
  // LedgerConnector,
]

export const SUPPORTED_WALLETS_MAPPING = SUPPORTED_WALLETS.reduce((wallets: any, connector: WalletConnector) => ({
  ...wallets,
  [connector.id]: connector,
}))

export const SUPPORTED_WALLETS2: WalletConnector2[] = [
  MetaMaskConnector2,
  WalletConnectConnector2,
  WalletLinkConnector2,
]
