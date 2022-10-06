import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import PolygonLogo from '../resources/svg/networks/polygon-matic-logo.svg'
import { ALCHEMY_POLYGON_API_KEY, POLYGONSCAN_API_KEY } from '../constants'
import { hexValue } from 'ethers/lib/utils'

import solaceABI from '../constants/abi/SOLACE.json'
import { KEY_ADDRS } from '../constants/addresses/mumbai'

const chainId = 80001

export const MumbaiNetwork: NetworkConfig = {
  name: 'Mumbai',
  chainId: chainId,
  isTestnet: true,
  logo: PolygonLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: Unit.MATIC, decimals: 18 },
  rpc: {
    httpsUrl: `https://polygon-mumbai.g.alchemy.com/v2/${String(ALCHEMY_POLYGON_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 1,
  },
  explorer: {
    name: 'Polygonscan',
    key: String(POLYGONSCAN_API_KEY),
    url: 'https://mumbai.polygonscan.com/',
    apiUrl: 'https://api-testnet.polygonscan.com/',
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
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Mumbai Network',
    nativeCurrency: { name: 'Matic', symbol: Unit.MATIC, decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.matic.today'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
