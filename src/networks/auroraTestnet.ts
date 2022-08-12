import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import AuroraLogo from '../resources/svg/networks/aurora-logo.svg'
import { hexValue } from 'ethers/lib/utils'
import { KEY_ADDRS } from '../constants/addresses/auroraTestnet'

import solaceABI from '../constants/abi/SOLACE.json'

import { WETH9_TOKEN } from '../constants/mappings/token'

import { AURORASCAN_API_KEY } from '../constants'

const chainId = 1313161555

export const AuroraTestnetNetwork: NetworkConfig = {
  name: 'Aurora Testnet',
  chainId: chainId,
  isTestnet: true,
  logo: AuroraLogo,
  supportedTxTypes: [0],
  nativeCurrency: { mainnetReference: WETH9_TOKEN.address[1], symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://testnet.aurora.dev`,
    pollingInterval: 12_000,
    blockConfirms: 3,
  },
  explorer: {
    name: 'Aurorascan',
    url: 'https://testnet.aurorascan.dev',
    apiUrl: 'https://api-testnet.aurorascan.dev',
    excludedContractAddrs: [KEY_ADDRS.SOLACE],
    key: String(AURORASCAN_API_KEY),
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
    underwritingPoolAddr: '0x501ace27a074471f099fffec008bd1b151c7f7de',
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Aurora Testnet',
    nativeCurrency: { name: 'ETH', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://testnet.aurora.dev'],
    blockExplorerUrls: ['https://testnet.aurorascan.dev'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
