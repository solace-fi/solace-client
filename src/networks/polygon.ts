import { BondName, Unit } from '../constants/enums'
import { NetworkConfig, TellerToken } from '../constants/types'
import PolygonLogo from '../resources/svg/networks/polygon-matic-logo.svg'
import { ALCHEMY_POLYGON_API_KEY, POLYGONSCAN_API_KEY } from '../constants'
import { hexValue } from 'ethers/lib/utils'

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

import { KEY_ADDRS, TELLER_ADDRS_V2 } from '../constants/addresses/polygon'

import bondTellerErc20Abi_V2 from '../constants/metadata/BondTellerErc20_V2.json'
import bondTellerMaticAbi from '../constants/metadata/BondTellerMatic.json'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import wmatic from '../constants/metadata/WMATIC.json'

const chainId = 137

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS_V2.DAI_TELLER]: {
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
      [BondName.WETH]: [TELLER_ADDRS_V2.WETH_TELLER],
      [BondName.MATIC]: [TELLER_ADDRS_V2.MATIC_TELLER],
      [BondName.USDC]: [TELLER_ADDRS_V2.USDC_TELLER],
      [BondName.WBTC]: [TELLER_ADDRS_V2.WBTC_TELLER],
      [BondName.USDT]: [TELLER_ADDRS_V2.USDT_TELLER],
      [BondName.FRAX]: [TELLER_ADDRS_V2.FRAX_TELLER],
    },
    specialContracts: {},
    specialFeatures: {},
    restrictedFeatures: {
      noBondingV1: true,
      noCoverProducts: true,
      noFarmingV1: true,
      noStakingV1: true,
    },
    underwritingPoolAddr: '0xd1108a800363C262774B990e9DF75a4287d5c075',
  },
  cache: {
    supportedProducts: [],
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Matic Network',
    nativeCurrency: { name: 'Matic', symbol: Unit.MATIC, decimals: 18 },
    rpcUrls: ['https://polygon-mainnet.g.alchemy.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
