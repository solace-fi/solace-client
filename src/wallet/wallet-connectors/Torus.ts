import { AbstractConnector } from '@web3-react/abstract-connector'
import { TorusConnector as Torus_Connector } from '@web3-react/torus-connector'
import { NetworkConfig } from '../../constants/types'
import TorusLogo from '../../resources/svg/wallets/torus-logo.svg'

export const TorusConnector = {
  id: 'torus',
  name: 'Torus',
  logo: TorusLogo,
  supportedTxTypes: [0],
  getConnector(network: NetworkConfig): AbstractConnector {
    return new Torus_Connector({
      chainId: network.chainId,
    })
  },
  onError(error: Error): Error | undefined {
    return error
  },
}
