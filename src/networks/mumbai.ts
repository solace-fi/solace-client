import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import PolygonLogo from '../resources/svg/networks/polygon-matic-logo.svg'
import { ALCHEMY_POLYGON_API_KEY, POLYGONSCAN_API_KEY } from '../constants'
import { hexValue } from 'ethers/lib/utils'

import solaceABI from '../constants/abi/SOLACE.json'
import xSolaceABI from '../constants/abi/xSOLACE.json'
import bridgeWrapperABI from '../constants/abi/BridgeWrapper.json'
import { KEY_ADDRS, SPECIAL_ADDRS } from '../constants/addresses/mumbai'
import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/mumbai'
import { FRAX_TOKEN } from '../constants/mappings/token'

import {
  xsLocker_ABI,
  SolaceCoverProductV2_ABI,
  StakingRewards_ABI,
  ERC20_ABI,
  StakingRewardsV2_ABI,
  CoverPaymentManager_ABI,
  SolaceCoverProductV3_ABI,
} from '../constants/abi'
import {
  COVER_PAYMENT_MANAGER_ADDRESS,
  SOLACE_COVER_PRODUCT_V3_ADDRESS,
  STAKING_REWARDS_V2_ADDRESS,
} from '@solace-fi/sdk-nightly'
const chainId = 80001

export const MumbaiNetwork: NetworkConfig = {
  name: 'Mumbai',
  chainId: chainId,
  isTestnet: true,
  logo: PolygonLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: Unit.MATIC, decimals: 18 },
  rpc: {
    httpsUrl: `https://polygon-mumbai.g.alchemy.com/v2/${String(ALCHEMY_POLYGON_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 1,
  },
  explorer: {
    name: 'Polygonscan',
    key: String(POLYGONSCAN_API_KEY),
    url: 'https://mumbai.polygonscan.com/',
    apiUrl: 'https://api-testnet.polygonscan.com/',
    excludedContractAddrs: [KEY_ADDRS.SOLACE, SPECIAL_ADDRS.BSOLACE],
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
      solaceCoverProduct: {
        addr: SPECIAL_ADDRS.SOLACE_COVER_PRODUCT_V2,
        abi: SolaceCoverProductV2_ABI,
        additionalInfo: 'v2',
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
      noBondingV1: true,
      noFarmingV1: true,
      noStakingV1: true,
    },
    specialFeatures: {
      unwrapBridgedSolace: true,
      solaceBuyLink: `https://app.uniswap.org/#/swap?chain=polygon_mumbai&inputCurrency=${FRAX_TOKEN.address[chainId]}&outputCurrency=${KEY_ADDRS.SOLACE}`,
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
  },
  cache: {
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Mumbai Network',
    nativeCurrency: { name: 'Matic', symbol: Unit.MATIC, decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.matic.today'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
