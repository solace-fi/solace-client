import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { ETHERSCAN_API_KEY, ALCHEMY_ETHEREUM_API_KEY } from '../constants'
import { Unit } from '../constants/enums'
import { hexValue } from '@ethersproject/bytes'
import { NetworkConfig } from '../constants/types'

/* core contract abi */
import solaceABI from '../constants/abi/SOLACE.json'
import xSolaceABI from '../constants/abi/xSOLACE.json'
import xSolaceV1ABI from '../constants/abi/xSOLACEV1.json'
import xSolaceMigratorABI from '../constants/abi/xSolaceMigrator.json'
import migration_ABI from '../constants/abi/Migration.json'

import { KEY_ADDRS, NATIVE_ADDRS } from '../constants/addresses/mainnet'
import { USDC_TOKEN, WETH9_TOKEN } from '../constants/mappings/token'
import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/mainnet'

import { xsLocker_ABI, SolaceCoverProductV3_ABI, CoverPaymentManager_ABI, StakingRewardsV2_ABI } from '../constants/abi'
import {
  COVER_PAYMENT_MANAGER_ADDRESS,
  NETWORKS_MAPPING,
  SOLACE_COVER_PRODUCT_V3_ADDRESS,
  STAKING_REWARDS_V2_ADDRESS,
} from '@solace-fi/sdk-nightly'
/*

When adding new products, please add into productContracts, functions, and cache

*/

const chainId = 1

export const MainNetwork: NetworkConfig = {
  name: 'Ethereum',
  chainId: chainId,
  isTestnet: false,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: WETH9_TOKEN.address[1], symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://eth-mainnet.alchemyapi.io/v2/${String(ALCHEMY_ETHEREUM_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 2,
  },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io',
    excludedContractAddrs: [KEY_ADDRS.SOLACE],
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
      xSolaceV1: {
        addr: KEY_ADDRS.XSOLACE_V1,
        abi: xSolaceV1ABI,
      },
      xsLocker: {
        addr: KEY_ADDRS.XSLOCKER,
        abi: xsLocker_ABI,
      },
      migration: {
        addr: KEY_ADDRS.MIGRATION,
        abi: migration_ABI,
      },
      xSolaceMigrator: {
        addr: KEY_ADDRS.XSOLACE_MIGRATOR,
        abi: xSolaceMigratorABI.abi,
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
    generalFeatures: { stakingV1: true, ...NETWORKS_MAPPING[chainId].features.general, native: false },
    specialFeatures: {
      solaceBuyLink: `https://app.sushi.com/swap?inputCurrency=${USDC_TOKEN.address[chainId]}&outputCurrency=${KEY_ADDRS.SOLACE}`,
    },
    specialContracts: {},
    underwritingPoolAddr: '0x5efc0d9ee3223229ce3b53e441016efc5ba83435',
  },
  cache: {
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
