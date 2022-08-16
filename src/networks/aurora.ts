import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import AuroraLogo from '../resources/svg/networks/aurora-logo.svg'
import { hexValue } from 'ethers/lib/utils'
import { KEY_ADDRS } from '../constants/addresses/aurora'
import { WETH9_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/abi/SOLACE.json'
import { AURORASCAN_API_KEY } from '../constants'

const chainId = 1313161554

export const AuroraNetwork: NetworkConfig = {
  name: 'Aurora',
  chainId: chainId,
  isTestnet: false,
  logo: AuroraLogo,
  supportedTxTypes: [0],
  nativeCurrency: { mainnetReference: WETH9_TOKEN.address[1], symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://mainnet.aurora.dev`,
    pollingInterval: 12_000,
    blockConfirms: 3,
  },
  explorer: {
    name: 'Aurorascan',
    url: 'https://aurorascan.dev',
    apiUrl: 'https://api.aurorascan.dev',
    excludedContractAddrs: [KEY_ADDRS.SOLACE],
    key: String(AURORASCAN_API_KEY),
  },
  config: {
    keyContracts: {
      solace: {
        addr: KEY_ADDRS.SOLACE,
        abi: solaceABI,
      },
      gaugeController: {
        addr: KEY_ADDRS.GAUGE_CONTROLLER,
        abi: null,
      },
      uwpLockVoting: {
        addr: KEY_ADDRS.UWP_LOCK_VOTING,
        abi: null,
      },
      uwpLocker: {
        addr: KEY_ADDRS.UWP_LOCKER,
        abi: null,
      },
      uwp: {
        addr: KEY_ADDRS.UWP,
        abi: null,
      },
      uwe: {
        addr: KEY_ADDRS.UWE,
        abi: null,
      },
      fluxMegaOracle: {
        addr: KEY_ADDRS.FLUX_MEGA_ORACLE,
        abi: null,
      },
    },
    generalFeatures: { native: true },
    specialFeatures: {
      hardcodedGasPrice: 0.07,
    },
    specialContracts: {},
    underwritingPoolAddr: '0x501ace27a074471f099fffec008bd1b151c7f7de',
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Aurora Mainnet',
    nativeCurrency: { name: 'ETH', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://mainnet.aurora.dev'],
    blockExplorerUrls: ['https://aurorascan.dev'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
