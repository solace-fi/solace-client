import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import PolygonLogo from '../resources/svg/networks/polygon-matic-logo.svg'
import { ALCHEMY_MUMBAI_API_KEY, POLYGONSCAN_API_KEY } from '../constants'
import { hexValue } from 'ethers/lib/utils'

export const MumbaiNetwork: NetworkConfig = {
  name: 'Mumbai',
  chainId: 80001,
  isTestnet: true,
  logo: PolygonLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.MATIC, decimals: 18 },
  rpc: {
    httpsUrl: `https://polygon-mumbai.g.alchemy.com/v2/${String(ALCHEMY_MUMBAI_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 1,
  },
  explorer: {
    name: 'Polygonscan',
    key: String(POLYGONSCAN_API_KEY),
    url: 'https://mumbai.polygonscan.com/',
    apiUrl: 'https://api-testnet.polygonscan.com/',
    excludedContractAddrs: [],
  },
  config: {
    keyContracts: {},
    productContracts: {},
    bondTellerContracts: {},
    featureRestrictions: {
      noBondingV1: true,
      noCoverProducts: true,
      noFarmingV1: true,
      noStakingV1: true,
    },
  },
  cache: {
    supportedProducts: [],
    tellerToTokenMapping: {},
  },
  metamaskChain: {
    chainId: hexValue(80001),
    chainName: 'Mumbai Network',
    nativeCurrency: { name: 'Matic', symbol: Unit.MATIC, decimals: 18 },
    rpcUrls: ['https://polygon-mumbai.g.alchemy.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
