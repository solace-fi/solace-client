import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { ETHERSCAN_API_KEY, ALCHEMY_ETHEREUM_API_KEY } from '../constants'
import { BondName, ProductName, Unit } from '../constants/enums'
import { hexValue } from '@ethersproject/bytes'
import { NetworkConfig, TellerToken } from '../constants/types'

/* core contract abi */
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
import compABI from '../constants/abi/contracts/products/CompoundProduct.sol/CompoundProduct.json'
import curveABI from '../constants/abi/contracts/products/CurveProduct.sol/CurveProduct.json'
import liquityABI from '../constants/abi/contracts/products/LiquityProduct.sol/LiquityProduct.json'
import sushiABI from '../constants/abi/contracts/products/SushiswapProduct.sol/SushiswapProduct.json'
import uniV2ABI from '../constants/abi/contracts/products/UniswapV2Product.sol/UniswapV2Product.json'
import uniV3ABI from '../constants/abi/contracts/products/UniswapV3Product.sol/UniswapV3Product.json'
import yearnABI from '../constants/abi/contracts/products/YearnV2Product.sol/YearnV2Product.json'

/* product objects */
import { AaveProduct } from '../products/aave'
import { CompoundProduct } from '../products/compound'
import { LiquityProduct } from '../products/liquity'
import { YearnProduct } from '../products/yearn'
import { CurveProduct } from '../products/curve'
import { UniswapV2Product } from '../products/uniswapV2'
import { UniswapV3Product } from '../products/uniswapV3'
import { SushiswapProduct } from '../products/sushiswap'

import { KEY_ADDRS, PRODUCT_ADDRS, TELLER_ADDRS_V1 } from '../constants/addresses/mainnet'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS_V1.DAI_TELLER]: {
    addr: '0x6b175474e89094c44da98b954eedeac495271d0f',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.ETH_TELLER]: {
    addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDC_TELLER]: {
    addr: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER]: {
    addr: '0x9c051f8a6648a51ef324d30c235da74d060153ac',
    isBondTellerErc20: true,
    isLp: true,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.SCP_TELLER]: {
    addr: '0x501acee83a6f269b77c167c6701843d454e2efa0',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.WBTC_TELLER]: {
    addr: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDT_TELLER]: {
    addr: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
}

export const MainNetwork: NetworkConfig = {
  name: 'Ethereum',
  chainId: 1,
  isTestnet: false,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://eth-mainnet.alchemyapi.io/v2/${String(ALCHEMY_ETHEREUM_API_KEY)}`,
    pollingInterval: 12_000,
  },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io',
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
      [ProductName.COMPOUND]: {
        addr: PRODUCT_ADDRS.COMPOUND_PRODUCT,
        abi: compABI,
      },
      [ProductName.CURVE]: {
        addr: PRODUCT_ADDRS.CURVE_PRODUCT,
        abi: curveABI,
      },
      [ProductName.LIQUITY]: {
        addr: PRODUCT_ADDRS.LIQUITY_PRODUCT,
        abi: liquityABI,
      },
      [ProductName.SUSHISWAP]: {
        addr: PRODUCT_ADDRS.SUSHISWAP_PRODUCT,
        abi: sushiABI,
      },
      [ProductName.UNISWAP_V2]: {
        addr: PRODUCT_ADDRS.UNISWAPV2_PRODUCT,
        abi: uniV2ABI,
      },
      [ProductName.UNISWAP_V3]: {
        addr: PRODUCT_ADDRS.UNISWAPV3_PRODUCT,
        abi: uniV3ABI,
      },
      [ProductName.YEARN]: {
        addr: PRODUCT_ADDRS.YEARN_PRODUCT,
        abi: yearnABI,
      },
    },
    bondTellerContracts: {
      [BondName.DAI]: { ['V1']: TELLER_ADDRS_V1.DAI_TELLER },
      [BondName.ETH]: { ['V1']: TELLER_ADDRS_V1.ETH_TELLER },
      [BondName.USDC]: { ['V1']: TELLER_ADDRS_V1.USDC_TELLER },
      [BondName.SOLACE_USDC_SLP]: { ['V1']: TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER },
      [BondName.SCP]: { ['V1']: TELLER_ADDRS_V1.SCP_TELLER },
      [BondName.WBTC]: { ['V1']: TELLER_ADDRS_V1.WBTC_TELLER },
      [BondName.USDT]: { ['V1']: TELLER_ADDRS_V1.USDT_TELLER },
    },
    availableFeatures: {
      bondingV1: true,
      bondingV2: false,
      stakingV1: true,
      stakingV2: true,
      farmingV1: true,
      coverProducts: true,
    },
  },
  cache: {
    supportedProducts: [
      AaveProduct,
      CompoundProduct,
      LiquityProduct,
      YearnProduct,
      CurveProduct,
      UniswapV2Product,
      UniswapV3Product,
      SushiswapProduct,
    ],
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(1),
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://eth-mainnet.alchemyapi.io'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
