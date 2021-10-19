import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { ETHERSCAN_API_KEY, ALCHEMY_API_KEY } from '../constants'
import { ProductName, Unit } from '../constants/enums'
import { hexValue } from '@ethersproject/bytes'
import { NetworkConfig } from '../constants/types'

/* core contract abi */
import farmControllerABI from '../constants/abi/contracts/FarmController.sol/FarmController.json'
import optionsFarmingABI from '../constants/abi/contracts/OptionsFarming.sol/OptionsFarming.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import wethABI from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
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
    excludedContractAddrs: [],
  },
  config: {
    keyContracts: {
      farmController: {
        addr: String(process.env.REACT_APP_MAINNET_FARM_CONTROLLER_ADDR),
        abi: farmControllerABI,
      },
      optionsFarming: {
        addr: String(process.env.REACT_APP_MAINNET_OPTIONS_FARMING_ADDR),
        abi: optionsFarmingABI,
      },
      vault: {
        addr: String(process.env.REACT_APP_MAINNET_VAULT_ADDR),
        abi: vaultABI,
      },
      treasury: {
        addr: String(process.env.REACT_APP_MAINNET_TREASURY_ADDR),
        abi: treasuryABI,
      },
      solace: {
        addr: String(process.env.REACT_APP_MAINNET_SOLACE_ADDR),
        abi: solaceABI,
      },
      cpFarm: {
        addr: String(process.env.REACT_APP_MAINNET_CPFARM_ADDR),
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: String(process.env.REACT_APP_MAINNET_LPFARM_ADDR),
        abi: null,
      },
      registry: {
        addr: String(process.env.REACT_APP_MAINNET_REGISTRY_ADDR),
        abi: registryABI,
      },
      lpToken: {
        addr: String(process.env.REACT_APP_MAINNET_UNISWAP_LPTOKEN_ADDR),
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: String(process.env.REACT_APP_MAINNET_WETH_ADDR),
        abi: wethABI,
      },
      claimsEscrow: {
        addr: String(process.env.REACT_APP_MAINNET_CLAIMS_ESCROW_ADDR),
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: String(process.env.REACT_APP_MAINNET_POLICY_MANAGER_ADDR),
        abi: polMagABI,
      },
      lpAppraisor: {
        addr: String(process.env.REACT_APP_MAINNET_LPAPPRAISOR_ADDR),
        abi: null,
      },
      riskManager: {
        addr: String(process.env.REACT_APP_MAINNET_RISK_MANAGER_ADDR),
        abi: riskManagerABI,
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
    productsRev: {
      [String(process.env.REACT_APP_MAINNET_AAVE_PRODUCT_ADDR)]: ProductName.AAVE,
      [String(process.env.REACT_APP_MAINNET_COMPOUND_PRODUCT_ADDR)]: ProductName.COMPOUND,
      [String(process.env.REACT_APP_MAINNET_CURVE_PRODUCT_ADDR)]: ProductName.CURVE,
      [String(process.env.REACT_APP_MAINNET_LIQUITY_PRODUCT_ADDR)]: ProductName.LIQUITY,
      [String(process.env.REACT_APP_MAINNET_SUSHISWAP_PRODUCT_ADDR)]: ProductName.SUSHISWAP,
      [String(process.env.REACT_APP_MAINNET_UNISWAPV2_PRODUCT_ADDR)]: ProductName.UNISWAP_V2,
      [String(process.env.REACT_APP_MAINNET_UNISWAPV3_PRODUCT_ADDR)]: ProductName.UNISWAP_V3,
      [String(process.env.REACT_APP_MAINNET_YEARN_PRODUCT_ADDR)]: ProductName.YEARN,
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
