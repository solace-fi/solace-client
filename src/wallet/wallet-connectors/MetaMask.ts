import { InjectedConnector } from '@web3-react/injected-connector'
import BrowserWalletLogo from '../../resources/svg/wallets/browserWallet.svg'

import { networks } from '../../context/NetworkManager'

export const MetaMaskConnector = {
  id: 'metamask',
  name: 'MetaMask',
  logo: BrowserWalletLogo,
  supportedTxTypes: [0, 2],
  connector: new InjectedConnector({
    supportedChainIds: networks.map((network) => network.chainId),
  }),
}
