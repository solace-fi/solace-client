import { AbstractConnector } from '@web3-react/abstract-connector'
import { FortmaticConnector as Fortmatic_Connector } from '@web3-react/fortmatic-connector'
import { NetworkConfig } from '../../constants/types'
import FortmaticLogo from '../../resources/svg/wallets/fortmatic-logo.svg'

export const FortmaticConnector = {
  id: 'fortmatic',
  name: 'Fortmatic',
  logo: FortmaticLogo,
  getConnector(network: NetworkConfig): AbstractConnector {
    return new Fortmatic_Connector({
      chainId: network.chainId,
      apiKey: String(process.env.REACT_APP_FORTMATIC_API_KEY),
    })
  },
  onError(error: Error): Error | undefined {
    return error
  },
}
