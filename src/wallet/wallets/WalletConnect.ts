import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector as WalletConnect_Connector } from '@web3-react/walletconnect-connector'
import { RPC_URLS, POLLING_INTERVAL, WALLET_CONNECT_BRIDGE } from '../../constants'

import WalletConnectLogo from '../../resources/svg/wallets/walletconnect-logo.svg'

export const WalletConnectConnector = {
  id: 'walletconnect',
  name: 'WalletConnect',
  logo: WalletConnectLogo,
  getConnector: (): AbstractConnector => {
    return new WalletConnect_Connector({
      rpc: { 4: RPC_URLS[4], 42: RPC_URLS[42] },
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
