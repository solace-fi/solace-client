import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { hexValue } from 'ethers/lib/utils'

export const AuroraTestnetNetwork: NetworkConfig = {
  name: 'Aurora Test',
  chainId: 1313161555,
  isTestnet: true,
  // logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://testnet.aurora.dev`,
    pollingInterval: 12_000,
  },
  explorer: {
    name: 'Explorer',
    url: 'https://explorer.testnet.aurora.dev',
    apiUrl: 'https://explorer.testnet.aurora.dev',
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
    chainId: hexValue(1313161555),
    chainName: 'Aurora Testnet',
    nativeCurrency: { name: 'ETH', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://testnet.aurora.dev'],
    blockExplorerUrls: ['https://explorer.testnet.aurora.dev'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
