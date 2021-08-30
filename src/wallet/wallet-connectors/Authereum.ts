import { AbstractConnector } from '@web3-react/abstract-connector'
import { AuthereumConnector as Authereum_Connector } from '@web3-react/authereum-connector'
import { NetworkConfig } from '../../constants/types'
import AuthereumLogo from '../../resources/svg/wallets/authereum-logo.svg'

export const AuthereumConnector = {
  id: 'authereum',
  name: 'Authereum',
  logo: AuthereumLogo,
  supportedTxTypes: [0],
  getConnector(network: NetworkConfig): AbstractConnector {
    return new Authereum_Connector({
      chainId: network.chainId,
    })
  },
  onError(error: Error): Error | undefined {
    return error
  },
}
