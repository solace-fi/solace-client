import { KEY_ADDRS, NATIVE_ADDRS } from '../constants/addresses/fantom'
import { Unit } from '../constants/enums'
import { WFTM_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/abi/SOLACE.json'
import xSolaceABI from '../constants/abi/xSOLACE.json'
import { hexValue } from 'ethers/lib/utils'

import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/fantom'
import { FTMSCAN_API_KEY } from '../constants'
import { NetworkConfig } from '../constants/types'
import FantomLogo from '../resources/svg/networks/fantom-logo.svg'

import { xsLocker_ABI, SolaceCoverProductV3_ABI, CoverPaymentManager_ABI, StakingRewardsV2_ABI } from '../constants/abi'
import {
  COVER_PAYMENT_MANAGER_ADDRESS,
  NETWORKS_MAPPING,
  SOLACE_COVER_PRODUCT_V3_ADDRESS,
  STAKING_REWARDS_V2_ADDRESS,
} from '@solace-fi/sdk-nightly'
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
    underwritingPoolAddr: '0x2971f45c0952437934B3F055C401241e5C339F93',
  },
  cache: {
    tellerToTokenMapping,
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
