import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector as WalletConnect_Connector } from '@web3-react/walletconnect-connector'
import { WALLET_CONNECT_BRIDGE } from '../../constants'
import { NetworkConfig } from '../../constants/types'
import { networks } from '../../context/NetworkManager'

import WalletConnectLogo from '../../resources/svg/wallets/walletconnect-logo.svg'

export const WalletConnectConnector = {
  id: 'walletconnect',
  name: 'WalletConnect',
  logo: WalletConnectLogo,
  supportedTxTypes: [0],
  getConnector(): AbstractConnector {
    return new WalletConnect_Connector({
      supportedChainIds: networks.map((network) => network.chainId),
      rpc: networks.reduce(
        (rpcUrls: any, network: NetworkConfig) => ({
          ...rpcUrls,
          [network.chainId]: network.rpc.httpsUrl,
        }),
        {}
      ),
      bridge: WALLET_CONNECT_BRIDGE,
      qrcode: true,
    })
  },
  onDisconnect(connector?: WalletConnect_Connector): void {
    connector?.close()
  },
  onError(error: Error): Error | undefined {
    return error
  },
}
