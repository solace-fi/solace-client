import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletLinkConnector as WalletLink_Connector } from '@web3-react/walletlink-connector'
import { NetworkConfig } from '../../constants/types'
import { networks } from '../../context/NetworkManager'

import CoinbaseWalletLogo from '../../resources/svg/wallets/coinbase-logo.svg'

export const WalletLinkConnector = {
  id: 'coinbase',
  name: 'Coinbase Wallet',
  logo: CoinbaseWalletLogo,
  supportedTxTypes: [0],
  getConnector(): AbstractConnector {
    return new WalletLink_Connector({
      supportedChainIds: networks.map((network) => network.chainId),
      url: networks[0].rpc.httpsUrl,
      appName: 'solace-coinbase',
    })
  },
  onDisconnect(connector?: WalletLink_Connector): void {
    connector?.close()
  },
  onError(error: Error): Error | undefined {
    const { code } = (error as any) as { code: number }

    if (code === 4001) {
      // USER_DENIED_REQUEST_ACCOUNTS
      return undefined
    }

    return error
  },
}

export const WalletLinkConnector2 = {
  id: 'coinbase',
  name: 'Coinbase Wallet',
  logo: CoinbaseWalletLogo,
  supportedTxTypes: [0],
  connector: new WalletLink_Connector({
    supportedChainIds: networks.map((network) => network.chainId),
    url: networks[0].rpc.httpsUrl,
    appName: 'solace-coinbase',
  }),
}
