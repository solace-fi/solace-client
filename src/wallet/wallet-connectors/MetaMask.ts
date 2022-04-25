import { AbstractConnector } from '@web3-react/abstract-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import {
  MetamaskAddEthereumChain,
  MetamaskSwitchEthereumChain,
  MetamaskWatchAsset,
  NetworkConfig,
} from '../../constants/types'
import MetamaskLogo from '../../resources/svg/wallets/metamask-logo.svg'

import { networks } from '../../context/NetworkManager'

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
  supportedTxTypes: [0, 2],
  getConnector() {
    return new MetamaskConnector({
      supportedChainIds: networks.map((network) => network.chainId),
    })
  },
  onError: (error: MetaMaskError): Error | undefined => {
    if (error.code === -32002) {
      return new Error('MetaMask is already processing. Please verify MetaMask extension.')
    }

    return undefined
  },
}

export const MetaMaskConnector2 = {
  id: 'metamask',
  name: 'MetaMask',
  logo: MetamaskLogo,
  supportedTxTypes: [0, 2],
  connector: new InjectedConnector({
    supportedChainIds: networks.map((network) => network.chainId),
  }),
}
