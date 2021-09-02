import { AbstractConnector } from '@web3-react/abstract-connector'
import { NetworkConfig } from '../constants/types'
import { MetaMaskConnector } from './wallet-connectors/MetaMask'
import { WalletConnectConnector } from './wallet-connectors/WalletConnect'
import { WalletLinkConnector } from './wallet-connectors/WalletLink'
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
  getConnector(network: NetworkConfig, args?: Record<string, any>): AbstractConnector
  onConnect?(connector: AbstractConnector, args?: Record<string, any>): void
  onDisconnect?(connector?: AbstractConnector): void
  onError(error: Error): Error | undefined
}

export const SUPPORTED_WALLETS: WalletConnector[] = [
  MetaMaskConnector,
  WalletConnectConnector,
  WalletLinkConnector,
  FortmaticConnector,
  AuthereumConnector,
  TorusConnector,
  PortisConnector,
  TrezorConnector,
  LedgerConnector,
]
