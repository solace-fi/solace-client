import { AbstractConnector } from '@web3-react/abstract-connector'
import { injected } from '../connectors'

export type MetaMaskError = Error & {
  code: number
}

export const MetaMaskConnector = {
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
}
