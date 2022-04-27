import { InjectedConnector } from '@web3-react/injected-connector'
import MetamaskLogo from '../../resources/svg/wallets/metamask-logo.svg'

import { networks } from '../../context/NetworkManager'

export const MetaMaskConnector = {
  id: 'metamask',
  name: 'MetaMask',
  logo: MetamaskLogo,
  supportedTxTypes: [0, 2],
  connector: new InjectedConnector({
    supportedChainIds: networks.map((network) => network.chainId),
  }),
}
