import { BondName, Unit } from '../constants/enums'
import { NetworkConfig, TellerToken } from '../constants/types'
import AuroraLogo from '../resources/svg/networks/aurora-logo.svg'
import { hexValue } from 'ethers/lib/utils'
import { KEY_ADDRS, TELLER_ADDRS_V2, SPECIAL_ADDRS } from '../constants/addresses/auroraTestnet'

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
  NEAR_ADDRESS,
  AURORA_ADDRESS,
} from '../constants/mappings/tokenAddressMapping'

import bridgeWrapperABI from '../constants/metadata/BridgeWrapper.json'
import IERC20 from '../constants/metadata/IERC20Metadata.json'
import bondTellerErc20Abi_V2 from '../constants/metadata/BondTellerErc20_V2.json'
import bondTellerEthAbi_V2 from '../constants/metadata/BondTellerEth_V2.json'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import weth9 from '../constants/abi/contracts/WETH9.sol/WETH9.json'

const chainId = 1313161555

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
  [TELLER_ADDRS_V2.ETH_TELLER]: {
    name: BondName.ETH,
    addr: WETH9_ADDRESS[chainId],
    principalAbi: weth9,
    tellerAbi: bondTellerEthAbi_V2.abi,
    mainnetAddr: WETH9_ADDRESS[1],
    tokenId: 'ethereum',
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
  [TELLER_ADDRS_V2.NEAR_TELLER]: {
    name: BondName.NEAR,
    addr: NEAR_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: '',
    tokenId: 'near',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.AURORA_TELLER]: {
    name: BondName.AURORA,
    addr: AURORA_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: AURORA_ADDRESS[1],
    tokenId: 'aurora',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}

export const AuroraTestnetNetwork: NetworkConfig = {
  name: 'Aurora Testnet',
  chainId: chainId,
  isTestnet: true,
  logo: AuroraLogo,
  supportedTxTypes: [0],
  nativeCurrency: { mainnetReference: WETH9_ADDRESS[1], symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://testnet.aurora.dev`,
    pollingInterval: 12_000,
    blockConfirms: 3,
  },
  explorer: {
    name: 'Explorer',
    url: 'https://explorer.testnet.aurora.dev',
    apiUrl: 'https://explorer.testnet.aurora.dev',
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
    },
    productContracts: {},
    restrictedFeatures: {
      noBondingV1: true,
      noCoverProducts: true,
      noFarmingV1: true,
      noStakingV1: true,
      cannotBuySolace: true,
    },
    specialFeatures: {
      unwrapBridgedSolace: true,
    },
    specialContracts: {
      bSolace: {
        addr: SPECIAL_ADDRS.BSOLACE,
        abi: IERC20.abi,
      },
      bridgeWrapper: {
        addr: SPECIAL_ADDRS.BRIDGE_WRAPPER,
        abi: bridgeWrapperABI.abi,
      },
    },
    underwritingPoolAddr: '0x501ace27a074471f099fffec008bd1b151c7f7de',
  },
  cache: {
    supportedProducts: [],
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(chainId),
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
