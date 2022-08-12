import { KEY_ADDRS } from '../constants/addresses/fantom'
import { Unit } from '../constants/enums'
import { WFTM_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/abi/SOLACE.json'
import { hexValue } from 'ethers/lib/utils'

import { FTMSCAN_API_KEY } from '../constants'
import { NetworkConfig } from '../constants/types'
import FantomLogo from '../resources/svg/networks/fantom-logo.svg'

const chainId = 250

export const FantomNetwork: NetworkConfig = {
  name: 'Fantom',
  chainId: chainId,
  isTestnet: false,
  logo: FantomLogo,
  supportedTxTypes: [0],
  nativeCurrency: { mainnetReference: WFTM_TOKEN.address[1], symbol: Unit.FTM, decimals: 18 },
  rpc: {
    httpsUrl: `https://rpc.ftm.tools/`,
    pollingInterval: 12_000,
    blockConfirms: 1,
  },
  explorer: {
    name: 'FTMscan',
    url: 'https://ftmscan.com/',
    apiUrl: 'https://api.ftmscan.com/',
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
    underwritingPoolAddr: '0x2971f45c0952437934B3F055C401241e5C339F93',
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Fantom',
    nativeCurrency: { name: 'FTM', symbol: Unit.FTM, decimals: 18 },
    rpcUrls: ['https://rpc.ftm.tools/'],
    blockExplorerUrls: ['https://ftmscan.com/'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
