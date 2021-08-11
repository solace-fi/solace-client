import { AbstractConnector } from '@web3-react/abstract-connector'
import { InjectedConnector } from '@web3-react/injected-connector'

import MetamaskLogo from '../../resources/svg/wallets/metamask-logo.svg'

export type MetaMaskError = Error & {
  code: number
}

export const MetaMaskConnector = {
  id: 'metamask',
  name: 'MetaMask',
  logo: MetamaskLogo,
  getConnector: (): AbstractConnector => {
    return new InjectedConnector({
      supportedChainIds: [4, 42],
    })
  },
  onError: (error: MetaMaskError): Error | undefined => {
    if (error.code === -32002) {
      return new Error('MetaMask is already processing. Please verify MetaMask extension.')
    }

    return undefined
  },
}
