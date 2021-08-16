import { AbstractConnector } from '@web3-react/abstract-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { MetamaskAddEthereumChain, MetamaskSwitchEthereumChain, MetamaskWatchAsset } from '../../constants/types'
import MetamaskLogo from '../../resources/svg/wallets/metamask-logo.svg'

export type MetaMaskError = Error & {
  code: number
}

export class MetamaskConnector extends InjectedConnector {
  addChain(...infos: MetamaskAddEthereumChain[]): Promise<Error | null> {
    return this.getProvider().then((provider) => {
      return provider.request({
        method: 'wallet_addEthereumChain',
        params: infos,
      })
    })
  }

  switchChain(info: MetamaskSwitchEthereumChain): Promise<Error | null> {
    return this.getProvider().then((provider) => {
      return provider.request({
        method: 'wallet_switchEthereumChain',
        params: [info],
      })
    })
  }

  addToken(info: MetamaskWatchAsset): Promise<boolean> {
    return this.getProvider().then((provider) => {
      return provider.request({
        method: 'wallet_watchAsset',
        params: info,
      })
    })
  }
}

export const MetaMaskConnector = {
  id: 'metamask',
  name: 'MetaMask',
  logo: MetamaskLogo,
  getConnector: (): AbstractConnector => {
    return new MetamaskConnector({
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
