import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector as WalletConnect_Connector } from '@web3-react/walletconnect-connector'
import { POLLING_INTERVAL, WALLET_CONNECT_BRIDGE } from '../../constants'
import { NetworkConfig } from '../../constants/types'

import WalletConnectLogo from '../../resources/svg/wallets/walletconnect-logo.svg'

export const WalletConnectConnector = {
  id: 'walletconnect',
  name: 'WalletConnect',
  logo: WalletConnectLogo,
  getConnector(network: NetworkConfig): AbstractConnector {
    return new WalletConnect_Connector({
      rpc: { [network.chainId]: network.rpc.httpsUrl },
      pollingInterval: POLLING_INTERVAL,
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
