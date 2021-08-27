import { AbstractConnector } from '@web3-react/abstract-connector'
import { TrezorConnector as Trezor_Connector } from '@web3-react/trezor-connector'
import { NetworkConfig } from '../../constants/types'
import TrezorLogo from '../../resources/svg/wallets/trezor-logo.svg'

export const TrezorConnector = {
  id: 'trezor',
  name: 'Trezor',
  logo: TrezorLogo,
  supportedTxTypes: [0],
  getConnector(network: NetworkConfig): AbstractConnector {
    return new Trezor_Connector({
      chainId: network.chainId,
      url: network.rpc.httpsUrl,
      pollingInterval: network.rpc.pollingInterval,
      manifestEmail: network.walletConfig.trezorEmail,
      manifestAppUrl: network.walletConfig.trezorAppUrl,
      config: {
        networkId: network.chainId,
      },
    })
  },
  onError(error: Error): Error | undefined {
    if (error.message === 'Cancelled') {
      return undefined
    }
    if (error.message === 'Popup closed') {
      return undefined
    }

    return error
  },
}
