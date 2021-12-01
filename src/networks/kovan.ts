import { BondName, ProductName, Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import { ETHERSCAN_API_KEY, ALCHEMY_API_KEY } from '../constants'
import { hexValue } from '@ethersproject/bytes'
import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'

/*  core contract abi */
import farmControllerABI from '../constants/abi/contracts/FarmController.sol/FarmController.json'
import farmRewardsABI from '../constants/metadata/FarmRewards.json'
import optionsFarmingABI from '../constants/abi/contracts/OptionsFarming.sol/OptionsFarming.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import xSolaceABI from '../constants/abi/contracts/xSOLACE.sol/xSOLACE.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import sptFarmABI from '../constants/abi/contracts/SptFarm.sol/SptFarm.json'
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import riskManagerABI from '../constants/abi/contracts/RiskManager.sol/RiskManager.json'
import bondDepoABI from '../constants/abi/contracts/BondDepository.sol/BondDepository.json'

/* product contract abi */
import aaveABI from '../constants/abi/contracts/products/AaveV2Product.sol/AaveV2Product.json'
import waaveABI from '../constants/abi/contracts/products/WaaveProduct.sol/WaaveProduct.json'

/* product objects */
import { AaveProduct } from '../products/aave'
import { WaaveProduct } from '../products/waave'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const tellerToTokenMapping: {
  [key: string]: { addr: string; isBondTellerErc20: boolean; isLp: boolean }
} = {
  [String(process.env.REACT_APP_KOVAN_DAI_TELLER_ADDR)]: {
    addr: '0xc56010e957c325b140f182b4fbee61c2fb95fdb3',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_KOVAN_ETH_TELLER_ADDR)]: {
    addr: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    isBondTellerErc20: false,
    isLp: false,
  },
  [String(process.env.REACT_APP_KOVAN_USDC_TELLER_ADDR)]: {
    addr: '0xefd4e002d58a66e9ea53f9ebf0583aecc6e183f0',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_KOVAN_SOLACE_USDC_SLP_TELLER_ADDR)]: {
    addr: '0x13465d2d66be93764b33577c73fc2411917fe9e4',
    isBondTellerErc20: true,
    isLp: true,
  },
  [String(process.env.REACT_APP_KOVAN_SCP_TELLER_ADDR)]: {
    addr: '0x501acee83a6f269b77c167c6701843d454e2efa0',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_KOVAN_WBTC_TELLER_ADDR)]: {
    addr: '0x1063bf969f8d3d7296a2a94274d3df9202da2a3a',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_KOVAN_USDT_TELLER_ADDR)]: {
    addr: '0xaea2b0f4763c8ffc33a4c454cd08f803b02b6b53',
    isBondTellerErc20: true,
    isLp: false,
  },
  // [String(process.env.REACT_APP_KOVAN_SOLACE_ETH_SLP_TELLER_ADDR)]: {
  //   addr: '0x64844b869abb2f310442a692bd1cc84b393b2777',
  //   isBondTellerErc20: true,
  //   isLp: true,
  // },
  // [String(process.env.REACT_APP_KOVAN_SOLACE_DAI_SLP_TELLER_ADDR)]: {
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
    excludedContractAddrs: [
      String(process.env.REACT_APP_KOVAN_UNISWAP_LPTOKEN_ADDR),
      String(process.env.REACT_APP_KOVAN_LPFARM_ADDR),
      String(process.env.REACT_APP_KOVAN_SOLACE_ADDR),
    ],
  },
  config: {
    keyContracts: {
      farmController: {
        addr: String(process.env.REACT_APP_KOVAN_FARM_CONTROLLER_ADDR),
        abi: farmControllerABI,
      },
      farmRewards: {
        addr: String(process.env.REACT_APP_KOVAN_FARM_REWARDS_ADDR),
        abi: farmRewardsABI,
      },
      optionsFarming: {
        addr: String(process.env.REACT_APP_KOVAN_OPTIONS_FARMING_ADDR),
        abi: optionsFarmingABI,
      },
      vault: {
        addr: String(process.env.REACT_APP_KOVAN_VAULT_ADDR),
        abi: vaultABI,
      },
      treasury: {
        addr: String(process.env.REACT_APP_KOVAN_TREASURY_ADDR),
        abi: treasuryABI,
      },
      solace: {
        addr: String(process.env.REACT_APP_KOVAN_SOLACE_ADDR),
        abi: solaceABI,
      },
      xSolace: {
        addr: String(process.env.REACT_APP_KOVAN_XSOLACE_ADDR),
        abi: xSolaceABI,
      },
      cpFarm: {
        addr: String(process.env.REACT_APP_KOVAN_CPFARM_ADDR),
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: String(process.env.REACT_APP_KOVAN_LPFARM_ADDR),
        abi: null,
      },
      sptFarm: {
        addr: String(process.env.REACT_APP_KOVAN_SPTFARM_ADDR),
        abi: sptFarmABI,
      },
      registry: {
        addr: String(process.env.REACT_APP_KOVAN_REGISTRY_ADDR),
        abi: registryABI,
      },
      lpToken: {
        addr: String(process.env.REACT_APP_KOVAN_UNISWAP_LPTOKEN_ADDR),
        abi: lpTokenArtifact.abi,
      },
      claimsEscrow: {
        addr: String(process.env.REACT_APP_KOVAN_CLAIMS_ESCROW_ADDR),
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: String(process.env.REACT_APP_KOVAN_POLICY_MANAGER_ADDR),
        abi: polMagABI,
      },
      lpAppraisor: {
        addr: String(process.env.REACT_APP_KOVAN_LPAPPRAISOR_ADDR),
        abi: null,
      },
      riskManager: {
        addr: String(process.env.REACT_APP_KOVAN_RISK_MANAGER_ADDR),
        abi: riskManagerABI,
      },
      bondDepo: {
        addr: String(process.env.REACT_APP_KOVAN_BOND_DEPO_ADDR),
        abi: bondDepoABI,
      },
    },
    productContracts: {
      [ProductName.AAVE]: {
        addr: String(process.env.REACT_APP_KOVAN_AAVE_PRODUCT_ADDR),
        abi: aaveABI,
      },
      [ProductName.WAAVE]: {
        addr: String(process.env.REACT_APP_KOVAN_WAAVE_PRODUCT_ADDR),
        abi: waaveABI,
      },
    },
    bondTellerContracts: {
      [BondName.DAI]: String(process.env.REACT_APP_KOVAN_DAI_TELLER_ADDR),
      // [BondName.SOLACE_DAI_SLP]: String(process.env.REACT_APP_KOVAN_SOLACE_DAI_SLP_TELLER_ADDR),
      [BondName.ETH]: String(process.env.REACT_APP_KOVAN_ETH_TELLER_ADDR),
      // [BondName.SOLACE_ETH_SLP]: String(process.env.REACT_APP_KOVAN_SOLACE_ETH_SLP_TELLER_ADDR),
      [BondName.USDC]: String(process.env.REACT_APP_KOVAN_USDC_TELLER_ADDR),
      [BondName.SOLACE_USDC_SLP]: String(process.env.REACT_APP_KOVAN_SOLACE_USDC_SLP_TELLER_ADDR),
      [BondName.SCP]: String(process.env.REACT_APP_KOVAN_SCP_TELLER_ADDR),
      [BondName.WBTC]: String(process.env.REACT_APP_KOVAN_WBTC_TELLER_ADDR),
      [BondName.USDT]: String(process.env.REACT_APP_KOVAN_USDT_TELLER_ADDR),
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
