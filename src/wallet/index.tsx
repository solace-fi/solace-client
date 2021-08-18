import { AbstractConnector } from '@web3-react/abstract-connector'
import { NetworkConfig } from '../constants/types'
import { MetaMaskConnector } from './wallets/MetaMask'
import { WalletConnectConnector } from './wallets/WalletConnect'
import { WalletLinkConnector } from './wallets/WalletLink'
import { FortmaticConnector } from './wallets/Fortmatic'
import { AuthereumConnector } from './wallets/Authereum'
import { TorusConnector } from './wallets/Torus'
import { PortisConnector } from './wallets/Portis'

export interface WalletConnector {
  name: string
  id: string
  logo: string
  getConnector(network: NetworkConfig): AbstractConnector
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
]
