import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import AuroraLogo from '../resources/svg/networks/aurora-logo.svg'
import { hexValue } from 'ethers/lib/utils'
import { KEY_ADDRS, SPECIAL_ADDRS } from '../constants/addresses/auroraTestnet'

import solaceABI from '../constants/abi/SOLACE.json'
import xSolaceABI from '../constants/abi/xSOLACE.json'

import { NEAR_TOKEN, WETH9_TOKEN } from '../constants/mappings/token'

import bridgeWrapperABI from '../constants/abi/BridgeWrapper.json'

import { AURORASCAN_API_KEY } from '../constants'
import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/auroraTestnet'

import {
  xsLocker_ABI,
  ERC20_ABI,
  StakingRewards_ABI,
  StakingRewardsV2_ABI,
  CoverPaymentManager_ABI,
  SolaceCoverProductV3_ABI,
} from '../constants/abi'
import {
  COVER_PAYMENT_MANAGER_ADDRESS,
  SOLACE_COVER_PRODUCT_V3_ADDRESS,
  STAKING_REWARDS_V2_ADDRESS,
} from '@solace-fi/sdk-nightly'
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
        abi: xsLocker_ABI,
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
    restrictedFeatures: {
      noSoteria: true,
      noBondingV1: true,
      noFarmingV1: true,
      noStakingV1: true,
    },
    specialFeatures: {
      solaceBuyLink: `https://www.trisolaris.io/#/swap?inputCurrency=${NEAR_TOKEN.address[chainId]}&outputCurrency=${KEY_ADDRS.SOLACE}`,
      unwrapBridgedSolace: true,
    },
    specialContracts: {
      bSolace: {
        addr: SPECIAL_ADDRS.BSOLACE,
        abi: ERC20_ABI,
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
