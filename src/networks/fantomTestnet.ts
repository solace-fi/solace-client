import { KEY_ADDRS } from '../constants/addresses/fantomTestnet'
import { Unit } from '../constants/enums'
import { WFTM_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/abi/SOLACE.json'
import { hexValue } from 'ethers/lib/utils'

import { FTMSCAN_API_KEY } from '../constants'
import { NetworkConfig } from '../constants/types'
import FantomLogo from '../resources/svg/networks/fantom-logo.svg'

const chainId = 4002

export const FantomTestnetNetwork: NetworkConfig = {
  name: 'Fantom Testnet',
  chainId: chainId,
  isTestnet: true,
  logo: FantomLogo,
  supportedTxTypes: [0],
  nativeCurrency: { mainnetReference: WFTM_TOKEN.address[1], symbol: Unit.FTM, decimals: 18 },
  rpc: {
    httpsUrl: `https://rpc.testnet.fantom.network/`,
    pollingInterval: 12_000,
    blockConfirms: 1,
  },
  explorer: {
    name: 'FTMscan',
    url: 'https://testnet.ftmscan.com/',
    apiUrl: 'https://api-testnet.ftmscan.com/',
    excludedContractAddrs: [KEY_ADDRS.SOLACE],
    key: String(FTMSCAN_API_KEY),
  },
  config: {
    keyContracts: {
      solace: {
        addr: KEY_ADDRS.SOLACE,
        abi: solaceABI,
      },
    },
    specialContracts: {},
    generalFeatures: { native: false },
    specialFeatures: {},
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Fantom Testnet',
    nativeCurrency: { name: 'FTM', symbol: Unit.FTM, decimals: 18 },
    rpcUrls: ['https://rpc.testnet.fantom.network/'],
    blockExplorerUrls: ['https://testnet.ftmscan.com/'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
