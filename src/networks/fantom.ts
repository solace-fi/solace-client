import { KEY_ADDRS, SPECIAL_ADDRS } from '../constants/addresses/fantom'
import { Unit } from '../constants/enums'
import { WFTM_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/abi/SOLACE.json'
import xSolaceABI from '../constants/abi/xSOLACE.json'
// import xsLockerABI from '../constants/abi/xsLocker.json'
// import stakingRewardsABI from '../constants/abi/StakingRewards.json'
import { hexValue } from 'ethers/lib/utils'

import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/fantom'
import { FTMSCAN_API_KEY } from '../constants'
import { NetworkConfig } from '../constants/types'
import FantomLogo from '../resources/svg/networks/fantom-logo.svg'
// import solaceCoverProductV2ABI from '../constants/abi/SolaceCoverProductV2.json'

import {
  xsLocker_ABI,
  SolaceCoverProductV2_ABI,
  StakingRewards_ABI,
  SolaceCoverProductV3_ABI,
  CoverPaymentManager_ABI,
  StakingRewardsV2_ABI,
} from '../constants/abi'
import {
  COVER_PAYMENT_MANAGER_ADDRESS,
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
    httpsUrl: `https://rpc.ankr.com/fantom`,
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
      solaceCoverProduct: {
        addr: SPECIAL_ADDRS.SOLACE_COVER_PRODUCT_V2,
        abi: SolaceCoverProductV2_ABI,
        additionalInfo: 'v2',
      },
      stakingRewards: {
        addr: KEY_ADDRS.STAKING_REWARDS,
        abi: StakingRewards_ABI,
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
    },
    specialContracts: {},
    restrictedFeatures: {
      noBondingV1: true,
      noFarmingV1: true,
      noStakingV1: true,
    },
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
    rpcUrls: ['https://rpc.ankr.com/fantom'],
    blockExplorerUrls: ['https://ftmscan.com/'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
