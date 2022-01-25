import { BondName, ProductName, Unit } from '../constants/enums'
import { NetworkConfig, TellerToken } from '../constants/types'
import { ETHERSCAN_API_KEY, ALCHEMY_API_KEY } from '../constants'
import { hexValue } from '@ethersproject/bytes'
import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'

/*  core contract abi */
import farmControllerABI from '../constants/abi/contracts/FarmController.sol/FarmController.json'
import farmRewardsABI from '../constants/metadata/FarmRewardsV2.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import xSolaceABI from '../constants/metadata/xSOLACE.json'
import xSolaceV1ABI from '../constants/abi/contracts/xSOLACE.sol/xSOLACE.json'
import xsLockerABI from '../constants/metadata/xsLocker.json'
import stakingRewardsABI from '../constants/metadata/StakingRewards.json'
import xSolaceMigratorABI from '../constants/metadata/xSolaceMigrator.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import bondDepoABI from '../constants/abi/contracts/BondDepository.sol/BondDepository.json'
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import riskManagerABI from '../constants/abi/contracts/RiskManager.sol/RiskManager.json'
/* product contract abi */
import aaveABI from '../constants/abi/contracts/products/AaveV2Product.sol/AaveV2Product.json'
import waaveABI from '../constants/abi/contracts/products/WaaveProduct.sol/WaaveProduct.json'

/* product objects */
import { AaveProduct } from '../products/aave'
import { WaaveProduct } from '../products/waave'

import { KEY_ADDRS, PRODUCT_ADDRS, TELLER_ADDRS } from '../constants/addresses/kovan'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS.DAI_TELLER]: {
    addr: '0xc56010e957c325b140f182b4fbee61c2fb95fdb3',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
  },
  [TELLER_ADDRS.ETH_TELLER]: {
    addr: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
  },
  [TELLER_ADDRS.USDC_TELLER]: {
    addr: '0xefd4e002d58a66e9ea53f9ebf0583aecc6e183f0',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
  },
  [TELLER_ADDRS.SOLACE_USDC_SLP_TELLER]: {
    addr: '0x13465d2d66be93764b33577c73fc2411917fe9e4',
    isBondTellerErc20: true,
    isLp: true,
    isDisabled: false,
  },
  [TELLER_ADDRS.SCP_TELLER]: {
    addr: '0x501acee83a6f269b77c167c6701843d454e2efa0',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
  },
  [TELLER_ADDRS.WBTC_TELLER]: {
    addr: '0x1063bf969f8d3d7296a2a94274d3df9202da2a3a',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
  },
  [TELLER_ADDRS.USDT_TELLER]: {
    addr: '0xaea2b0f4763c8ffc33a4c454cd08f803b02b6b53',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
  },
  // [TELLER_ADDRS.SOLACE_ETH_SLP_TELLER]: {
  //   addr: '0x64844b869abb2f310442a692bd1cc84b393b2777',
  //   isBondTellerErc20: true,
  //   isLp: true,
  // },
  // [TELLER_ADDRS.SOLACE_DAI_SLP_TELLER]: {
  //   addr: '0x836c25e0fe4edc95443a88b6694d7e3be37d98bd',
  //   isBondTellerErc20: true,
  //   isLp: true,
  // },
}

export const KovanNetwork: NetworkConfig = {
  name: 'kovan',
  chainId: 42,
  isTestnet: true,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: { httpsUrl: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_API_KEY}`, pollingInterval: 12_000 },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://kovan.etherscan.io',
    apiUrl: 'https://api-kovan.etherscan.io',
    excludedContractAddrs: [KEY_ADDRS.SOLACE, KEY_ADDRS.VAULT],
  },
  config: {
    keyContracts: {
      farmController: {
        addr: KEY_ADDRS.FARM_CONTROLLER,
        abi: farmControllerABI,
      },
      farmRewards: {
        addr: KEY_ADDRS.FARM_REWARDS,
        abi: farmRewardsABI.abi,
      },
      vault: {
        addr: KEY_ADDRS.VAULT,
        abi: vaultABI,
      },
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
        abi: xsLockerABI.abi,
      },
      stakingRewards: {
        addr: KEY_ADDRS.STAKING_REWARDS,
        abi: stakingRewardsABI.abi,
      },
      xSolaceMigrator: {
        addr: KEY_ADDRS.XSOLACE_MIGRATOR,
        abi: xSolaceMigratorABI.abi,
      },
      cpFarm: {
        addr: KEY_ADDRS.CPFARM,
        abi: cpFarmABI,
      },
      claimsEscrow: {
        addr: KEY_ADDRS.CLAIMS_ESCROW,
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: KEY_ADDRS.POLICY_MANAGER,
        abi: polMagABI,
      },
      riskManager: {
        addr: KEY_ADDRS.RISK_MANAGER,
        abi: riskManagerABI,
      },
      bondDepo: {
        addr: KEY_ADDRS.BOND_DEPO,
        abi: bondDepoABI,
      },
    },
    productContracts: {
      [ProductName.AAVE]: {
        addr: PRODUCT_ADDRS.AAVE_PRODUCT,
        abi: aaveABI,
      },
      [ProductName.WAAVE]: {
        addr: PRODUCT_ADDRS.WAAVE_PRODUCT,
        abi: waaveABI,
      },
    },
    bondTellerContracts: {
      [BondName.DAI]: TELLER_ADDRS.DAI_TELLER,
      // [BondName.SOLACE_DAI_SLP]: TELLER_ADDRS.SOLACE_DAI_SLP_TELLER,
      [BondName.ETH]: TELLER_ADDRS.ETH_TELLER,
      // [BondName.SOLACE_ETH_SLP]: TELLER_ADDRS.SOLACE_ETH_SLP_TELLER,
      [BondName.USDC]: TELLER_ADDRS.USDC_TELLER,
      [BondName.SOLACE_USDC_SLP]: TELLER_ADDRS.SOLACE_USDC_SLP_TELLER,
      [BondName.SCP]: TELLER_ADDRS.SCP_TELLER,
      [BondName.WBTC]: TELLER_ADDRS.WBTC_TELLER,
      [BondName.USDT]: TELLER_ADDRS.USDT_TELLER,
    },
  },
  cache: {
    supportedProducts: [AaveProduct, WaaveProduct],
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(42),
    chainName: 'Kovan Testnet',
    nativeCurrency: { name: 'Ether', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://eth-kovan.alchemyapi.io'],
    blockExplorerUrls: ['https://kovan.etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
