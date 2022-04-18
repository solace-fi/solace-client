import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { ETHERSCAN_API_KEY, ALCHEMY_ETHEREUM_API_KEY } from '../constants'
import { ProductName, Unit } from '../constants/enums'
import { hexValue } from '@ethersproject/bytes'
import { NetworkConfig } from '../constants/types'

/* core contract abi */
import farmControllerABI from '../constants/metadata/FarmController.json'
import farmRewardsABI from '../constants/metadata/FarmRewardsV2.json'
import vaultABI from '../constants/metadata/Vault.json'
import solaceABI from '../constants/metadata/SOLACE.json'
import xSolaceABI from '../constants/metadata/xSOLACE.json'
import xSolaceV1ABI from '../constants/metadata/xSOLACEV1.json'
import xsLockerABI from '../constants/metadata/xsLocker.json'
import stakingRewardsABI from '../constants/metadata/StakingRewards.json'
import xSolaceMigratorABI from '../constants/metadata/xSolaceMigrator.json'
import cpFarmABI from '../constants/metadata/CpFarm.json'
import claimsEscrowABI from '../constants/metadata/ClaimsEscrow.json'
import polMagABI from '../constants/metadata/PolicyManager.json'
import riskManagerABI from '../constants/metadata/RiskManager.json'
import solaceCoverProductABI from '../constants/metadata/SolaceCoverProduct.json'

/* product contract abi */
import aaveABI from '../constants/metadata/AaveV2Product.json'
import compABI from '../constants/metadata/CompoundProduct.json'
import curveABI from '../constants/metadata/CurveProduct.json'
import liquityABI from '../constants/metadata/LiquityProduct.json'
import sushiABI from '../constants/metadata/SushiswapProduct.json'
import uniV2ABI from '../constants/metadata/UniswapV2Product.json'
import uniV3ABI from '../constants/metadata/UniswapV3Product.json'
import yearnABI from '../constants/metadata/YearnV2Product.json'

/* product objects */
import { AaveProduct } from '../products/aave'
import { CompoundProduct } from '../products/compound'
import { LiquityProduct } from '../products/liquity'
import { YearnProduct } from '../products/yearn'
import { CurveProduct } from '../products/curve'
import { UniswapV2Product } from '../products/uniswapV2'
import { UniswapV3Product } from '../products/uniswapV3'
import { SushiswapProduct } from '../products/sushiswap'

import { KEY_ADDRS, PRODUCT_ADDRS } from '../constants/addresses/mainnet'
import { USDC_TOKEN, WETH9_TOKEN } from '../constants/mappings/token'
import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/mainnet'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const chainId = 1

export const MainNetwork: NetworkConfig = {
  name: 'Ethereum',
  chainId: chainId,
  isTestnet: false,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: WETH9_TOKEN.address[1], symbol: Unit.ETH, decimals: 18 },
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
      solaceCoverProduct: {
        addr: KEY_ADDRS.SOLACE_COVER_PRODUCT,
        abi: solaceCoverProductABI.abi,
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
    restrictedFeatures: {},
    specialFeatures: {
      solaceBuyLink: `https://app.sushi.com/swap?inputCurrency=${USDC_TOKEN.address[chainId]}&outputCurrency=${KEY_ADDRS.SOLACE}`,
    },
    specialContracts: {},
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
    chainId: hexValue(chainId),
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
