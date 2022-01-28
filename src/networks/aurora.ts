import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { hexValue } from 'ethers/lib/utils'

export const AuroraNetwork: NetworkConfig = {
  name: 'Aurora',
  chainId: 1313161554,
  isTestnet: false,
  // logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://mainnet.aurora.dev`,
    pollingInterval: 12_000,
  },
  explorer: {
    name: 'Explorer',
    url: 'https://explorer.mainnet.aurora.dev',
    apiUrl: 'https://explorer.mainnet.aurora.dev',
    excludedContractAddrs: [],
  },
  config: {
    keyContracts: {},
    productContracts: {},
    bondTellerContracts: {},
    availableFeatures: {
      bondingV1: true,
      coverProducts: false,
      farmingV1: false,
      stakingV1: false,
      stakingV2: true,
    },
  },
  cache: {
    supportedProducts: [],
    tellerToTokenMapping: {},
  },
  metamaskChain: {
    chainId: hexValue(1313161554),
    chainName: 'Aurora Mainnet',
    nativeCurrency: { name: 'ETH', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://mainnet.aurora.dev'],
    blockExplorerUrls: ['https://explorer.mainnet.aurora.dev'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
