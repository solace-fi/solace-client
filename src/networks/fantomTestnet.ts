import { KEY_ADDRS, NATIVE_ADDRS } from '../constants/addresses/fantomTestnet'
import { Unit } from '../constants/enums'
import { WFTM_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/abi/SOLACE.json'
import xSolaceABI from '../constants/abi/xSOLACE.json'
import { hexValue } from 'ethers/lib/utils'

import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/fantomTestnet'
import { FTMSCAN_API_KEY } from '../constants'
import { NetworkConfig } from '../constants/types'
import FantomLogo from '../resources/svg/networks/fantom-logo.svg'
import {
  COVER_PAYMENT_MANAGER_ADDRESS,
  NETWORKS_MAPPING,
  SOLACE_COVER_PRODUCT_V3_ADDRESS,
  STAKING_REWARDS_V2_ADDRESS,
} from '@solace-fi/sdk-nightly'

import { xsLocker_ABI, StakingRewardsV2_ABI, CoverPaymentManager_ABI, SolaceCoverProductV3_ABI } from '../constants/abi'

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
      xSolace: {
        addr: KEY_ADDRS.XSOLACE,
        abi: xSolaceABI.abi,
      },
      xsLocker: {
        addr: KEY_ADDRS.XSLOCKER,
        abi: xsLocker_ABI,
      },
      solaceCoverProductV3: {
        addr: SOLACE_COVER_PRODUCT_V3_ADDRESS[chainId],
        abi: SolaceCoverProductV3_ABI,
      },
      coverPaymentManager: {
        addr: COVER_PAYMENT_MANAGER_ADDRESS[chainId],
        abi: CoverPaymentManager_ABI,
      },
      stakingRewardsV2: {
        addr: STAKING_REWARDS_V2_ADDRESS[chainId],
        abi: StakingRewardsV2_ABI,
      },
      depositHelper: {
        addr: NATIVE_ADDRS.DEPOSIT_HELPER,
        abi: null,
      },
      gaugeController: {
        addr: NATIVE_ADDRS.GAUGE_CONTROLLER,
        abi: null,
      },
      uwLockVoting: {
        addr: NATIVE_ADDRS.UW_LOCK_VOTING,
        abi: null,
      },
      uwLocker: {
        addr: NATIVE_ADDRS.UW_LOCKER,
        abi: null,
      },
      uwp: {
        addr: NATIVE_ADDRS.UWP,
        abi: null,
      },
      uwe: {
        addr: NATIVE_ADDRS.UWE,
        abi: null,
      },
      fluxMegaOracle: {
        addr: NATIVE_ADDRS.FLUX_MEGA_ORACLE,
        abi: null,
      },
      solaceMegaOracle: {
        addr: NATIVE_ADDRS.SOLACE_MEGA_ORACLE,
        abi: null,
      },
      bribeController: {
        addr: NATIVE_ADDRS.BRIBE_CONTROLLER,
        abi: null,
      },
    },
    specialContracts: {},
    generalFeatures: { ...NETWORKS_MAPPING[chainId].features.general, native: false },
    specialFeatures: {},
  },
  cache: {
    tellerToTokenMapping,
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
