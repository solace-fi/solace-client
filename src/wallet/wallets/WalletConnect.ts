import { AbstractConnector } from '@web3-react/abstract-connector'
import { WalletConnectConnector as WalletConnect_Connector } from '@web3-react/walletconnect-connector'
import { walletconnect } from '../connectors'

export const WalletConnectConnector = {
  id: 'walletconnect',
  name: 'WalletConnect',
  getConnector: (): AbstractConnector => {
    return walletconnect
  },
  onDisconnect(connector?: WalletConnect_Connector): void {
    connector?.close()
  },
  onError(error: Error): Error | undefined {
    return error
  },
}
