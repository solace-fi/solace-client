import { AbstractConnector } from '@web3-react/abstract-connector'
import { MetaMaskConnector } from './wallet-connectors/MetaMask'
import { WalletConnectConnector } from './wallet-connectors/WalletConnect'
import { WalletLinkConnector } from './wallet-connectors/WalletLink'

export interface WalletConnector {
  name: string
  id: string
  logo: string
  supportedTxTypes: number[]
  connector: AbstractConnector
}

export const SUPPORTED_WALLETS: WalletConnector[] = [MetaMaskConnector, WalletConnectConnector, WalletLinkConnector]

export const SUPPORTED_WALLETS_MAPPING = SUPPORTED_WALLETS.reduce((wallets: any, connector: WalletConnector) => ({
  ...wallets,
  [connector.id]: connector,
}))
