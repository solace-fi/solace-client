import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { injected, walletconnect } from '../connectors'

export interface WalletConnector {
  name: string
  id: string
  getConnector(): AbstractConnector
  onConnect?(connector: AbstractConnector, args?: Record<string, any>): void
  onDisconnect?(connector?: AbstractConnector): void
  onError(error: Error): Error | undefined
}

export type MetaMaskError = Error & {
  code: number
}

export const SUPPORTED_WALLETS: WalletConnector[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    getConnector: (): AbstractConnector => {
      return injected
    },
    onError: (error: MetaMaskError): Error | undefined => {
      if (error.code === -32002) {
        return new Error('MetaMask is already processing. Please verify MetaMask extension.')
      }

      return undefined
    },
  },
  {
    id: 'walletconnect',
    name: 'Wallet Connect',
    getConnector: (): AbstractConnector => {
      return walletconnect
    },
    onDisconnect(connector?: WalletConnectConnector): void {
      connector?.close()
    },
    onError(error: Error): Error | undefined {
      return error
    },
  },
]
