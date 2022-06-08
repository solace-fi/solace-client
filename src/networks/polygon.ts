import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import PolygonLogo from '../resources/svg/networks/polygon-matic-logo.svg'
import { ALCHEMY_POLYGON_API_KEY, POLYGONSCAN_API_KEY } from '../constants'
import { hexValue } from 'ethers/lib/utils'

import solaceABI from '../constants/metadata/SOLACE.json'
import xSolaceABI from '../constants/metadata/xSOLACE.json'
import xsLockerABI from '../constants/metadata/xsLocker.json'
import stakingRewardsABI from '../constants/metadata/StakingRewards.json'
import solaceCoverProductV2ABI from '../constants/metadata/SolaceCoverProductV2.json'

import { KEY_ADDRS, SPECIAL_ADDRS } from '../constants/addresses/polygon'

import bridgeWrapperABI from '../constants/metadata/BridgeWrapper.json'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/polygon'
import { FRAX_TOKEN } from '../constants/mappings/token'

const chainId = 137

export const PolygonNetwork: NetworkConfig = {
  name: 'Polygon',
  chainId: chainId,
  isTestnet: false,
  logo: PolygonLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: Unit.MATIC, decimals: 18 },
  rpc: {
    httpsUrl: `https://polygon-mainnet.g.alchemy.com/v2/${String(ALCHEMY_POLYGON_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 1,
  },
  explorer: {
    name: 'Polygonscan',
    key: String(POLYGONSCAN_API_KEY),
    url: 'https://polygonscan.com',
    apiUrl: 'https://api.polygonscan.com',
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
        abi: xsLockerABI.abi,
      },
      stakingRewards: {
        addr: KEY_ADDRS.STAKING_REWARDS,
        abi: stakingRewardsABI.abi,
      },
      solaceCoverProduct: {
        addr: SPECIAL_ADDRS.SOLACE_COVER_PRODUCT_V2,
        abi: solaceCoverProductV2ABI.abi,
        additionalInfo: 'v2',
      },
    },
    restrictedFeatures: {
      noBondingV1: true,
      noFarmingV1: true,
      noStakingV1: true,
      noCoverageV3: true,
      noStakingRewardsV2: true,
    },
    specialFeatures: {
      unwrapBridgedSolace: true,
      solaceBuyLink: `https://app.uniswap.org/#/swap?chain=polygon&inputCurrency=${FRAX_TOKEN.address[chainId]}&outputCurrency=${KEY_ADDRS.SOLACE}`,
      hardcodedMaxFeePerGas: 31,
      hardcodedMaxPriorityFeePerGas: 31,
    },
    specialContracts: {
      bSolace: {
        addr: SPECIAL_ADDRS.BSOLACE,
        abi: ierc20Json.abi,
      },
      bridgeWrapper: {
        addr: SPECIAL_ADDRS.BRIDGE_WRAPPER,
        abi: bridgeWrapperABI.abi,
      },
    },
    underwritingPoolAddr: '0xd1108a800363C262774B990e9DF75a4287d5c075',
  },
  cache: {
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Matic Network',
    nativeCurrency: { name: 'Matic', symbol: Unit.MATIC, decimals: 18 },
    rpcUrls: ['https://rpc-mainnet.matic.network'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
