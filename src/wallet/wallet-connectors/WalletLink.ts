import { WalletLinkConnector as WalletLink_Connector } from '@web3-react/walletlink-connector'
import { networks } from '../../context/NetworkManager'

import CoinbaseWalletLogo from '../../resources/svg/wallets/coinbase-logo.svg'

export const WalletLinkConnector = {
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
