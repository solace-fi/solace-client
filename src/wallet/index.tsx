import { AbstractConnector } from '@web3-react/abstract-connector'
import { MetaMaskConnector } from './wallets/MetaMask'
import { WalletConnectConnector } from './wallets/WalletConnect'
import { WalletLinkConnector } from './wallets/WalletLink'

export interface WalletConnector {
  name: string
  id: string
  logo: string
  getConnector(): AbstractConnector
  onConnect?(connector: AbstractConnector, args?: Record<string, any>): void
  onDisconnect?(connector?: AbstractConnector): void
  onError(error: Error): Error | undefined
}

export const SUPPORTED_WALLETS: WalletConnector[] = [MetaMaskConnector, WalletConnectConnector, WalletLinkConnector]
