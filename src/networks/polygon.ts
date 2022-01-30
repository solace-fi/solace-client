import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import PolygonLogo from '../resources/svg/networks/polygon-matic-logo.svg'
import { ALCHEMY_POLYGON_API_KEY, POLYGONSCAN_API_KEY } from '../constants'
import { hexValue } from 'ethers/lib/utils'

export const PolygonNetwork: NetworkConfig = {
  name: 'Polygon',
  chainId: 137,
  isTestnet: false,
  logo: PolygonLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.MATIC, decimals: 18 },
  rpc: {
    httpsUrl: `https://polygon-mainnet.g.alchemy.com/v2/${String(ALCHEMY_POLYGON_API_KEY)}`,
    pollingInterval: 12_000,
  },
  explorer: {
    name: 'Polygonscan',
    key: String(POLYGONSCAN_API_KEY),
    url: 'https://polygonscan.com',
    apiUrl: 'https://api.polygonscan.com',
    excludedContractAddrs: [],
  },
  config: {
    keyContracts: {},
    productContracts: {},
    bondTellerContracts: {},
    availableFeatures: {
      bondingV1: true,
      bondingV2: false,
      coverProducts: false,
      farmingV1: false,
      soteria: true,
      stakingV1: false,
      stakingV2: true,
    },
  },
  cache: {
    supportedProducts: [],
    tellerToTokenMapping: {},
  },
  metamaskChain: {
    chainId: hexValue(137),
    chainName: 'Matic Network',
    nativeCurrency: { name: 'Matic', symbol: Unit.MATIC, decimals: 18 },
    rpcUrls: ['https://polygon-mainnet.g.alchemy.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
