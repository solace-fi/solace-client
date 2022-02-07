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
  WMATIC_ADDRESS,
} from '../constants/mappings/tokenAddressMapping'

import bondTellerErc20Abi_V2 from '../constants/metadata/BondTellerErc20_V2.json'
import bondTellerMaticAbi from '../constants/metadata/BondTellerMatic.json'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import wmatic from '../constants/metadata/WMATIC.json'

const chainId = 80001

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS_V2.DAI_TELLER]: {
    name: BondName.DAI,
    addr: DAI_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: DAI_ADDRESS[1],
    tokenId: 'dai',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WETH_TELLER]: {
    name: BondName.WETH,
    addr: WETH9_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: WETH9_ADDRESS[1],
    tokenId: 'ethereum',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.MATIC_TELLER]: {
    name: BondName.MATIC,
    addr: WMATIC_ADDRESS[chainId],
    principalAbi: wmatic.abi,
    tellerAbi: bondTellerMaticAbi.abi,
    mainnetAddr: WMATIC_ADDRESS[1],
    tokenId: 'matic-network',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDC_TELLER]: {
    name: BondName.USDC,
    addr: USDC_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: USDC_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WBTC_TELLER]: {
    name: BondName.WBTC,
    addr: WBTC_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: WBTC_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDT_TELLER]: {
    name: BondName.USDT,
    addr: USDT_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: USDT_ADDRESS[1],
    tokenId: 'tether',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.FRAX_TELLER]: {
    name: BondName.FRAX,
    addr: FRAX_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: FRAX_ADDRESS[1],
    tokenId: 'frax',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}

export const MumbaiNetwork: NetworkConfig = {
  name: 'Mumbai',
  chainId: chainId,
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
    chainId: hexValue(chainId),
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
