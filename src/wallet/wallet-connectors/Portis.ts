import { AbstractConnector } from '@web3-react/abstract-connector'
import { PortisConnector as Portis_Connector } from '@web3-react/portis-connector'
import { NetworkConfig } from '../../constants/types'
import PortisLogo from '../../resources/svg/wallets/portis-logo.svg'

export const PortisConnector = {
  id: 'portis',
  name: 'Portis',
  logo: PortisLogo,
  supportedTxTypes: [0],
  getConnector(network: NetworkConfig): AbstractConnector {
    return new Portis_Connector({
      dAppId: network.walletConfig.portisId,
      networks: [network.chainId],
    })
  },
  onError(error: Error): Error | undefined {
    return error
  },
}
