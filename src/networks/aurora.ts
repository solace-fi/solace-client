import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import AuroraLogo from '../resources/svg/networks/aurora-logo.svg'
import { hexValue } from 'ethers/lib/utils'
import { KEY_ADDRS, SPECIAL_ADDRS } from '../constants/addresses/aurora'
import { NEAR_TOKEN, WETH9_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/metadata/SOLACE.json'
import xSolaceABI from '../constants/metadata/xSOLACE.json'
import xsLockerABI from '../constants/metadata/xsLocker.json'
import stakingRewardsABI from '../constants/metadata/StakingRewards.json'
import bridgeWrapperABI from '../constants/metadata/BridgeWrapper.json'
import IERC20 from '../constants/metadata/IERC20Metadata.json'
import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/aurora'
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
    excludedContractAddrs: [KEY_ADDRS.SOLACE, SPECIAL_ADDRS.BSOLACE],
    key: String(AURORASCAN_API_KEY),
  },
  config: {
    keyContracts: {
      solace: {
        addr: KEY_ADDRS.SOLACE,
        abi: solaceABI,
      },
      xSolace: {
        addr: KEY_ADDRS.XSOLACE,
        abi: xSolaceABI.abi,
      },
      xsLocker: {
        addr: KEY_ADDRS.XSLOCKER,
        abi: xsLockerABI.abi,
      },
      stakingRewards: {
        addr: KEY_ADDRS.STAKING_REWARDS,
        abi: stakingRewardsABI.abi,
      },
    },
    restrictedFeatures: {
      noSoteria: true,
      noBondingV1: true,
      noFarmingV1: true,
      noStakingV1: true,
    },
    specialFeatures: {
      solaceBuyLink: `https://www.trisolaris.io/#/swap?inputCurrency=${NEAR_TOKEN.address[chainId]}&outputCurrency=${KEY_ADDRS.SOLACE}`,
      unwrapBridgedSolace: true,
      hardcodedGasPrice: 0.03,
    },
    specialContracts: {
      bSolace: {
        addr: SPECIAL_ADDRS.BSOLACE,
        abi: IERC20.abi,
      },
      bridgeWrapper: {
        addr: SPECIAL_ADDRS.BRIDGE_WRAPPER,
        abi: bridgeWrapperABI.abi,
      },
    },
    underwritingPoolAddr: '0x501ace27a074471f099fffec008bd1b151c7f7de',
  },
  cache: {
    tellerToTokenMapping,
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
