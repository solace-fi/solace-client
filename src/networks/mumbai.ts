import { BondName, Unit } from '../constants/enums'
import { NetworkConfig, TellerToken } from '../constants/types'
import PolygonLogo from '../resources/svg/networks/polygon-matic-logo.svg'
import { ALCHEMY_MUMBAI_API_KEY, POLYGONSCAN_API_KEY } from '../constants'
import { hexValue } from 'ethers/lib/utils'

import { KEY_ADDRS, TELLER_ADDRS_V2 } from '../constants/addresses/mumbai'

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
    addr: DAI_ADDRESS[80001],
    mainnetAddr: DAI_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.ETH_TELLER]: {
    addr: WETH9_ADDRESS[80001],
    mainnetAddr: WETH9_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDC_TELLER]: {
    addr: USDC_ADDRESS[80001],
    mainnetAddr: USDC_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WBTC_TELLER]: {
    addr: WBTC_ADDRESS[80001],
    mainnetAddr: WBTC_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDT_TELLER]: {
    addr: USDT_ADDRESS[80001],
    mainnetAddr: USDT_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.FRAX_TELLER]: {
    addr: FRAX_ADDRESS[80001],
    mainnetAddr: FRAX_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}

export const MumbaiNetwork: NetworkConfig = {
  name: 'Mumbai',
  chainId: 80001,
  isTestnet: true,
  logo: PolygonLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: Unit.MATIC, decimals: 18 },
  rpc: {
    httpsUrl: `https://polygon-mumbai.g.alchemy.com/v2/${String(ALCHEMY_MUMBAI_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 1,
  },
  explorer: {
    name: 'Polygonscan',
    key: String(POLYGONSCAN_API_KEY),
    url: 'https://mumbai.polygonscan.com/',
    apiUrl: 'https://api-testnet.polygonscan.com/',
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
    restrictedFeatures: {
      noBondingV1: true,
      noCoverProducts: true,
      noFarmingV1: true,
      noStakingV1: true,
      cannotBuySolace: true,
    },
    specialContracts: {},
    specialFeatures: {},
  },
  cache: {
    supportedProducts: [],
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(80001),
    chainName: 'Mumbai Network',
    nativeCurrency: { name: 'Matic', symbol: Unit.MATIC, decimals: 18 },
    rpcUrls: ['https://polygon-mumbai.g.alchemy.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
