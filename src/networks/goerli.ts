import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { hexValue } from 'ethers/lib/utils'
import { KEY_ADDRS, NATIVE_ADDRS } from '../constants/addresses/goerli'
import { WETH9_TOKEN } from '../constants/mappings/token'

import solaceABI from '../constants/abi/SOLACE.json'
import xSolaceABI from '../constants/abi/xSOLACE.json'

import { ALCHEMY_GOERLI_API_KEY, ETHERSCAN_API_KEY } from '../constants'

import gaugeControllerABI from '../constants/abi/GaugeController.json'
import underwritingPoolABI from '../constants/abi/UnderwritingPool.json'
import underwritingLockerABI from '../constants/abi/UnderwritingLocker.json'
import underwritingEquityABI from '../constants/abi/UnderwritingEquity.json'
import depositHelperABI from '../constants/abi/DepositHelper.json'
import fluxMegaOracleABI from '../constants/abi/FluxMegaOracle.json'
import solaceMegaOracleABI from '../constants/abi/SolaceMegaOracle.json'
import underwritingLockVotingABI from '../constants/abi/UnderwritingLockVoting.json'
import bribeControllerABI from '../constants/abi/BribeController.json'

import { xsLocker_ABI, StakingRewardsV2_ABI, CoverPaymentManager_ABI, SolaceCoverProductV3_ABI } from '../constants/abi'

import {
  COVER_PAYMENT_MANAGER_ADDRESS,
  NETWORKS_MAPPING,
  SOLACE_COVER_PRODUCT_V3_ADDRESS,
  STAKING_REWARDS_V2_ADDRESS,
} from '@solace-fi/sdk-nightly'

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
        abi: depositHelperABI,
      },
      gaugeController: {
        addr: NATIVE_ADDRS.GAUGE_CONTROLLER,
        abi: gaugeControllerABI,
      },
      uwLockVoting: {
        addr: NATIVE_ADDRS.UW_LOCK_VOTING,
        abi: underwritingLockVotingABI,
      },
      uwLocker: {
        addr: NATIVE_ADDRS.UW_LOCKER,
        abi: underwritingLockerABI,
      },
      uwp: {
        addr: NATIVE_ADDRS.UWP,
        abi: underwritingPoolABI,
      },
      uwe: {
        addr: NATIVE_ADDRS.UWE,
        abi: underwritingEquityABI,
      },
      fluxMegaOracle: {
        addr: NATIVE_ADDRS.FLUX_MEGA_ORACLE,
        abi: fluxMegaOracleABI,
      },
      solaceMegaOracle: {
        addr: NATIVE_ADDRS.SOLACE_MEGA_ORACLE,
        abi: solaceMegaOracleABI,
      },
      bribeController: {
        addr: NATIVE_ADDRS.BRIBE_CONTROLLER,
        abi: bribeControllerABI,
      },
    },
    generalFeatures: { ...NETWORKS_MAPPING[chainId].features.general, native: true },
    specialFeatures: {},
    specialContracts: {},
  },
  cache: {
    tellerToTokenMapping: {},
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
