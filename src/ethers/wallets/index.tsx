import { AbstractConnector } from '@web3-react/abstract-connector'
import { MetaMaskConnector, MetaMaskError } from '../connectors/MetaMask'

export interface WalletConnector {
  name: string
  id: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
  // getConnector(): AbstractConnector
  // onError(error: Error): Error | undefined
  connector: any
}

export const SUPPORTED_WALLETS: WalletConnector[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
    // getConnector(): AbstractConnector {
    //   return MetaMaskConnector.getConnector()
    // },
    // onError(error: MetaMaskError): Error | undefined {
    //   return MetaMaskConnector.onError(error)
    // },
    connector: MetaMaskConnector,
  },
]
