import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { hexValue } from 'ethers/lib/utils'
import { KEY_ADDRS } from '../constants/addresses/goerli'
import { WETH9_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/abi/SOLACE.json'
import { ALCHEMY_GOERLI_API_KEY, ETHERSCAN_API_KEY } from '../constants'

const chainId = 5

export const GoerliNetwork: NetworkConfig = {
  name: 'Goerli',
  chainId: chainId,
  isTestnet: true,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: WETH9_TOKEN.address[1], symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://eth-goerli.g.alchemy.com/v2/${String(ALCHEMY_GOERLI_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 3,
  },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://goerli.etherscan.io',
    apiUrl: 'https://api-goerli.etherscan.io',
    excludedContractAddrs: [KEY_ADDRS.SOLACE],
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
    specialFeatures: {},
    specialContracts: {},
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Goerli Testnet',
    nativeCurrency: { name: 'Ether', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
