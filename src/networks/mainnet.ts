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

import { KEY_ADDRS, PRODUCT_ADDRS, TELLER_ADDRS_V1, TELLER_ADDRS_V2 } from '../constants/addresses/mainnet'
import {
  DAI_ADDRESS,
  FRAX_ADDRESS,
  SCP_ADDRESS,
  SOLACE_USDC_SLP_ADDRESS,
  USDC_ADDRESS,
  USDT_ADDRESS,
  WBTC_ADDRESS,
  WETH9_ADDRESS,
} from '../constants/mappings/tokenAddressMapping'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS_V1.DAI_TELLER]: {
    addr: DAI_ADDRESS[1],
    mainnetAddr: DAI_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.ETH_TELLER]: {
    addr: WETH9_ADDRESS[1],
    mainnetAddr: WETH9_ADDRESS[1],
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDC_TELLER]: {
    addr: USDC_ADDRESS[1],
    mainnetAddr: USDC_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER]: {
    addr: SOLACE_USDC_SLP_ADDRESS[1],
    mainnetAddr: SOLACE_USDC_SLP_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: true,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.SCP_TELLER]: {
    addr: SCP_ADDRESS[1],
    mainnetAddr: SCP_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.WBTC_TELLER]: {
    addr: WBTC_ADDRESS[1],
    mainnetAddr: WBTC_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDT_TELLER]: {
    addr: USDT_ADDRESS[1],
    mainnetAddr: USDT_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    cannotBuy: true,
    version: 1,
  },
  [TELLER_ADDRS_V2.DAI_TELLER]: {
    addr: DAI_ADDRESS[1],
    mainnetAddr: DAI_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.ETH_TELLER]: {
    addr: WETH9_ADDRESS[1],
    mainnetAddr: WETH9_ADDRESS[1],
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDC_TELLER]: {
    addr: USDC_ADDRESS[1],
    mainnetAddr: USDC_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WBTC_TELLER]: {
    addr: WBTC_ADDRESS[1],
    mainnetAddr: WBTC_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDT_TELLER]: {
    addr: USDT_ADDRESS[1],
    mainnetAddr: USDT_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.SCP_TELLER]: {
    addr: SCP_ADDRESS[1],
    mainnetAddr: SCP_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.FRAX_TELLER]: {
    addr: FRAX_ADDRESS[1],
    mainnetAddr: FRAX_ADDRESS[1],
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
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
    blockConfirms: 2,
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
      [BondName.DAI]: [TELLER_ADDRS_V1.DAI_TELLER, TELLER_ADDRS_V2.DAI_TELLER],
      [BondName.ETH]: [TELLER_ADDRS_V1.ETH_TELLER, TELLER_ADDRS_V2.ETH_TELLER],
      [BondName.USDC]: [TELLER_ADDRS_V1.USDC_TELLER, TELLER_ADDRS_V2.USDC_TELLER],
      [BondName.SOLACE_USDC_SLP]: [TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER],
      [BondName.SCP]: [TELLER_ADDRS_V1.SCP_TELLER, TELLER_ADDRS_V2.SCP_TELLER],
      [BondName.WBTC]: [TELLER_ADDRS_V1.WBTC_TELLER, TELLER_ADDRS_V2.WBTC_TELLER],
      [BondName.USDT]: [TELLER_ADDRS_V1.USDT_TELLER, TELLER_ADDRS_V2.USDT_TELLER],
      [BondName.FRAX]: [TELLER_ADDRS_V2.FRAX_TELLER],
    },
    featureRestrictions: {},
    underwritingPoolAddr: '0x5efc0d9ee3223229ce3b53e441016efc5ba83435',
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
