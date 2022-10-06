import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { ETHERSCAN_API_KEY, ALCHEMY_ETHEREUM_API_KEY } from '../constants'
import { Unit } from '../constants/enums'
import { hexValue } from '@ethersproject/bytes'
import { NetworkConfig } from '../constants/types'

/* core contract abi */
import solaceABI from '../constants/abi/SOLACE.json'

import { KEY_ADDRS } from '../constants/addresses/mainnet'
import { WETH9_TOKEN } from '../constants/mappings/token'
/*

When adding new products, please add into productContracts, functions, and cache

*/

const chainId = 1

export const MainNetwork: NetworkConfig = {
  name: 'Ethereum',
  chainId: chainId,
  isTestnet: false,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: WETH9_TOKEN.address[1], symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://eth-mainnet.alchemyapi.io/v2/${String(ALCHEMY_ETHEREUM_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 2,
  },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io',
    excludedContractAddrs: [KEY_ADDRS.SOLACE],
  },
  config: {
    keyContracts: {
      solace: {
        addr: KEY_ADDRS.SOLACE,
        abi: solaceABI,
      },
    },
    generalFeatures: { native: false },
    specialFeatures: {},
    specialContracts: {},
    underwritingPoolAddr: '0x5efc0d9ee3223229ce3b53e441016efc5ba83435',
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
