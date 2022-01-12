import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { ETHERSCAN_API_KEY, ALCHEMY_API_KEY } from '../constants'
import { BondName, ProductName, Unit } from '../constants/enums'
import { hexValue } from '@ethersproject/bytes'
import { NetworkConfig } from '../constants/types'

/* core contract abi */
import farmControllerABI from '../constants/abi/contracts/FarmController.sol/FarmController.json'
import farmRewardsABI from '../constants/metadata/FarmRewards.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import xSolaceV1ABI from '../constants/abi/contracts/xSOLACE.sol/xSOLACE.json'
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

/*

When adding new products, please add into productContracts, functions, and cache

*/

const tellerToTokenMapping: {
  [key: string]: { addr: string; isBondTellerErc20: boolean; isLp: boolean }
} = {
  [String(process.env.REACT_APP_MAINNET_DAI_TELLER_ADDR)]: {
    addr: '0x6b175474e89094c44da98b954eedeac495271d0f',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_MAINNET_ETH_TELLER_ADDR)]: {
    addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    isBondTellerErc20: false,
    isLp: false,
  },
  [String(process.env.REACT_APP_MAINNET_USDC_TELLER_ADDR)]: {
    addr: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_MAINNET_SOLACE_USDC_SLP_TELLER_ADDR)]: {
    addr: '0x9c051f8a6648a51ef324d30c235da74d060153ac',
    isBondTellerErc20: true,
    isLp: true,
  },
  [String(process.env.REACT_APP_MAINNET_SCP_TELLER_ADDR)]: {
    addr: '0x501acee83a6f269b77c167c6701843d454e2efa0',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_MAINNET_WBTC_TELLER_ADDR)]: {
    addr: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_MAINNET_USDT_TELLER_ADDR)]: {
    addr: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    isBondTellerErc20: true,
    isLp: false,
  },
}

export const MainNetwork: NetworkConfig = {
  name: 'mainnet',
  chainId: 1,
  isTestnet: false,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: { httpsUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`, pollingInterval: 12_000 },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io',
    excludedContractAddrs: [
      String(process.env.REACT_APP_MAINNET_SOLACE_ADDR),
      String(process.env.REACT_APP_MAINNET_VAULT_ADDR),
    ],
  },
  config: {
    keyContracts: {
      farmController: {
        addr: String(process.env.REACT_APP_MAINNET_FARM_CONTROLLER_ADDR),
        abi: farmControllerABI,
      },
      farmRewards: {
        addr: String(process.env.REACT_APP_MAINNET_FARM_REWARDS_ADDR),
        abi: farmRewardsABI,
      },
      vault: {
        addr: String(process.env.REACT_APP_MAINNET_VAULT_ADDR),
        abi: vaultABI,
      },
      solace: {
        addr: String(process.env.REACT_APP_MAINNET_SOLACE_ADDR),
        abi: solaceABI,
      },
      xSolaceV1: {
        addr: String(process.env.REACT_APP_MAINNET_XSOLACE_V1_ADDR),
        abi: xSolaceV1ABI,
      },
      cpFarm: {
        addr: String(process.env.REACT_APP_MAINNET_CPFARM_ADDR),
        abi: cpFarmABI,
      },
      claimsEscrow: {
        addr: String(process.env.REACT_APP_MAINNET_CLAIMS_ESCROW_ADDR),
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: String(process.env.REACT_APP_MAINNET_POLICY_MANAGER_ADDR),
        abi: polMagABI,
      },
      riskManager: {
        addr: String(process.env.REACT_APP_MAINNET_RISK_MANAGER_ADDR),
        abi: riskManagerABI,
      },
      bondDepo: {
        addr: String(process.env.REACT_APP_MAINNET_BOND_DEPO_ADDR),
        abi: bondDepoABI,
      },
    },
    productContracts: {
      [ProductName.AAVE]: {
        addr: String(process.env.REACT_APP_MAINNET_AAVE_PRODUCT_ADDR),
        abi: aaveABI,
      },
      [ProductName.COMPOUND]: {
        addr: String(process.env.REACT_APP_MAINNET_COMPOUND_PRODUCT_ADDR),
        abi: compABI,
      },
      [ProductName.CURVE]: {
        addr: String(process.env.REACT_APP_MAINNET_CURVE_PRODUCT_ADDR),
        abi: curveABI,
      },
      [ProductName.LIQUITY]: {
        addr: String(process.env.REACT_APP_MAINNET_LIQUITY_PRODUCT_ADDR),
        abi: liquityABI,
      },
      [ProductName.SUSHISWAP]: {
        addr: String(process.env.REACT_APP_MAINNET_SUSHISWAP_PRODUCT_ADDR),
        abi: sushiABI,
      },
      [ProductName.UNISWAP_V2]: {
        addr: String(process.env.REACT_APP_MAINNET_UNISWAPV2_PRODUCT_ADDR),
        abi: uniV2ABI,
      },
      [ProductName.UNISWAP_V3]: {
        addr: String(process.env.REACT_APP_MAINNET_UNISWAPV3_PRODUCT_ADDR),
        abi: uniV3ABI,
      },
      [ProductName.YEARN]: {
        addr: String(process.env.REACT_APP_MAINNET_YEARN_PRODUCT_ADDR),
        abi: yearnABI,
      },
    },
    bondTellerContracts: {
      [BondName.DAI]: String(process.env.REACT_APP_MAINNET_DAI_TELLER_ADDR),
      [BondName.ETH]: String(process.env.REACT_APP_MAINNET_ETH_TELLER_ADDR),
      [BondName.USDC]: String(process.env.REACT_APP_MAINNET_USDC_TELLER_ADDR),
      [BondName.SOLACE_USDC_SLP]: String(process.env.REACT_APP_MAINNET_SOLACE_USDC_SLP_TELLER_ADDR),
      [BondName.SCP]: String(process.env.REACT_APP_MAINNET_SCP_TELLER_ADDR),
      [BondName.WBTC]: String(process.env.REACT_APP_MAINNET_WBTC_TELLER_ADDR),
      [BondName.USDT]: String(process.env.REACT_APP_MAINNET_USDT_TELLER_ADDR),
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
