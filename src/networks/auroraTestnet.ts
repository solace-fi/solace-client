import { BondName, Unit } from '../constants/enums'
import { NetworkConfig, TellerToken } from '../constants/types'
import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { hexValue } from 'ethers/lib/utils'
import { KEY_ADDRS, TELLER_ADDRS_V2 } from '../constants/addresses/auroraTestnet'

import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import xSolaceABI from '../constants/metadata/xSOLACE.json'
import xsLockerABI from '../constants/metadata/xsLocker.json'
import stakingRewardsABI from '../constants/metadata/StakingRewards.json'

import {
  DAI_ADDRESS,
  WETH9_ADDRESS,
  USDC_ADDRESS,
  USDT_ADDRESS,
  WBTC_ADDRESS,
  FRAX_ADDRESS,
} from '../constants/mappings/tokenAddressMapping'

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS_V2.DAI_TELLER]: {
    addr: DAI_ADDRESS[1313161555],
    mainnetAddr: DAI_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.ETH_TELLER]: {
    addr: WETH9_ADDRESS[1313161555],
    mainnetAddr: WETH9_ADDRESS[1],
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDC_TELLER]: {
    addr: USDC_ADDRESS[1313161555],
    mainnetAddr: USDC_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WBTC_TELLER]: {
    addr: WBTC_ADDRESS[1313161555],
    mainnetAddr: WBTC_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDT_TELLER]: {
    addr: USDT_ADDRESS[1313161555],
    mainnetAddr: USDT_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.FRAX_TELLER]: {
    addr: FRAX_ADDRESS[1313161555],
    mainnetAddr: FRAX_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}

export const AuroraTestnetNetwork: NetworkConfig = {
  name: 'Aurora Testnet',
  chainId: 1313161555,
  isTestnet: true,
  // logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://testnet.aurora.dev`,
    pollingInterval: 12_000,
  },
  explorer: {
    name: 'Explorer',
    url: 'https://explorer.testnet.aurora.dev',
    apiUrl: 'https://explorer.testnet.aurora.dev',
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
        abi: xsLockerABI.abi,
      },
      stakingRewards: {
        addr: KEY_ADDRS.STAKING_REWARDS,
        abi: stakingRewardsABI.abi,
      },
    },
    productContracts: {},
    bondTellerContracts: {
      [BondName.DAI]: [TELLER_ADDRS_V2.DAI_TELLER],
      [BondName.ETH]: [TELLER_ADDRS_V2.ETH_TELLER],
      [BondName.USDC]: [TELLER_ADDRS_V2.USDC_TELLER],
      [BondName.WBTC]: [TELLER_ADDRS_V2.WBTC_TELLER],
      [BondName.USDT]: [TELLER_ADDRS_V2.USDT_TELLER],
      [BondName.FRAX]: [TELLER_ADDRS_V2.FRAX_TELLER],
    },
    availableFeatures: {
      bondingV1: false,
      bondingV2: true,
      coverProducts: false,
      farmingV1: false,
      soteria: true,
      stakingV1: false,
      stakingV2: true,
    },
  },
  cache: {
    supportedProducts: [],
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(1313161555),
    chainName: 'Aurora Testnet',
    nativeCurrency: { name: 'ETH', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://testnet.aurora.dev'],
    blockExplorerUrls: ['https://explorer.testnet.aurora.dev'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}