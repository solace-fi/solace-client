import { BondName, ProductName, Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
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
import liquityProductABI from '../constants/abi/contracts/products/LiquityProduct.sol/LiquityProduct.json'
import compABI from '../constants/abi/contracts/products/CompoundProductRinkeby.sol/CompoundProductRinkeby.json'
import waaveABI from '../constants/abi/contracts/products/WaaveProduct.sol/WaaveProduct.json'

/* product objects */
import { CompoundProduct } from '../products/compound'
import { WaaveProduct } from '../products/waave'
import { LiquityProduct } from '../products/liquity'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const tellerToTokenMapping: {
  [key: string]: { addr: string; isBondTellerErc20: boolean; isLp: boolean }
} = {
  [String(process.env.REACT_APP_RINKEBY_DAI_TELLER_ADDR)]: {
    addr: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_RINKEBY_ETH_TELLER_ADDR)]: {
    addr: '0xc778417e063141139fce010982780140aa0cd5ab',
    isBondTellerErc20: false,
    isLp: false,
  },
  [String(process.env.REACT_APP_RINKEBY_USDC_TELLER_ADDR)]: {
    addr: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_RINKEBY_SOLACE_USDC_SLP_TELLER_ADDR)]: {
    addr: '0x7bec68fb902f90ba84634e764c91fdffca04d084',
    isBondTellerErc20: true,
    isLp: true,
  },
  [String(process.env.REACT_APP_RINKEBY_SCP_TELLER_ADDR)]: {
    addr: '0x501acee83a6f269b77c167c6701843d454e2efa0',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_RINKEBY_WBTC_TELLER_ADDR)]: {
    addr: '0x20fb9cddbca5a5eb468c76010aec6ed4eacc037f',
    isBondTellerErc20: true,
    isLp: false,
  },
  [String(process.env.REACT_APP_RINKEBY_USDT_TELLER_ADDR)]: {
    addr: '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02',
    isBondTellerErc20: true,
    isLp: false,
  },
  // [String(process.env.REACT_APP_RINKEBY_SOLACE_ETH_SLP_TELLER_ADDR)]: {
  //   addr: '0x66844fbeb515f3da46c6129fe911f0cb436ba2e0',
  //   isBondTellerErc20: true,
  //   isLp: true,
  // },
  // [String(process.env.REACT_APP_RINKEBY_SOLACE_DAI_SLP_TELLER_ADDR)]: {
  //   addr: '0xf57fec00d4712e68fb0bceac77a2841edd7a155e',
  //   isBondTellerErc20: true,
  //   isLp: true,
  // },
}

export const RinkebyNetwork: NetworkConfig = {
  name: 'rinkeby',
  chainId: 4,
  isTestnet: true,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: { httpsUrl: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`, pollingInterval: 12_000 },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://rinkeby.etherscan.io',
    apiUrl: 'https://api-rinkeby.etherscan.io',
    excludedContractAddrs: [
      String(process.env.REACT_APP_RINKEBY_SOLACE_ADDR),
      String(process.env.REACT_APP_RINKEBY_VAULT_ADDR),
    ],
  },
  config: {
    keyContracts: {
      farmController: {
        addr: String(process.env.REACT_APP_RINKEBY_FARM_CONTROLLER_ADDR),
        abi: farmControllerABI,
      },
      farmRewards: {
        addr: String(process.env.REACT_APP_RINKEBY_FARM_REWARDS_ADDR),
        abi: farmRewardsABI.abi,
      },
      vault: {
        addr: String(process.env.REACT_APP_RINKEBY_VAULT_ADDR),
        abi: vaultABI,
      },
      solace: {
        addr: String(process.env.REACT_APP_RINKEBY_SOLACE_ADDR),
        abi: solaceABI,
      },
      xSolace: {
        addr: String(process.env.REACT_APP_RINKEBY_XSOLACE_ADDR),
        abi: xSolaceABI.abi,
      },
      xSolaceV1: {
        addr: String(process.env.REACT_APP_RINKEBY_XSOLACE_V1_ADDR),
        abi: xSolaceV1ABI,
      },
      xsLocker: {
        addr: String(process.env.REACT_APP_RINKEBY_XSLOCKER_ADDR),
        abi: xsLockerABI.abi,
      },
      stakingRewards: {
        addr: String(process.env.REACT_APP_RINKEBY_STAKING_REWARDS_ADDR),
        abi: stakingRewardsABI.abi,
      },
      xSolaceMigrator: {
        addr: String(process.env.REACT_APP_RINKEBY_XSOLACE_MIGRATOR_ADDR),
        abi: xSolaceMigratorABI.abi,
      },
      cpFarm: {
        addr: String(process.env.REACT_APP_RINKEBY_CPFARM_ADDR),
        abi: cpFarmABI,
      },
      claimsEscrow: {
        addr: String(process.env.REACT_APP_RINKEBY_CLAIMS_ESCROW_ADDR),
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: String(process.env.REACT_APP_RINKEBY_POLICY_MANAGER_ADDR),
        abi: polMagABI,
      },
      riskManager: {
        addr: String(process.env.REACT_APP_RINKEBY_RISK_MANAGER_ADDR),
        abi: riskManagerABI,
      },
      bondDepo: {
        addr: String(process.env.REACT_APP_RINKEBY_BOND_DEPO_ADDR),
        abi: bondDepoABI,
      },
    },
    productContracts: {
      [ProductName.COMPOUND]: {
        addr: String(process.env.REACT_APP_RINKEBY_COMPOUND_PRODUCT_ADDR),
        abi: compABI,
      },
      [ProductName.WAAVE]: {
        addr: String(process.env.REACT_APP_RINKEBY_WAAVE_PRODUCT_ADDR),
        abi: waaveABI,
      },
      [ProductName.LIQUITY]: {
        addr: String(process.env.REACT_APP_RINKEBY_LIQUITY_PRODUCT_ADDR),
        abi: liquityProductABI,
      },
    },
    bondTellerContracts: {
      [BondName.DAI]: String(process.env.REACT_APP_RINKEBY_DAI_TELLER_ADDR),
      // [BondName.SOLACE_DAI_SLP]: String(process.env.REACT_APP_RINKEBY_SOLACE_DAI_SLP_TELLER_ADDR),
      [BondName.ETH]: String(process.env.REACT_APP_RINKEBY_ETH_TELLER_ADDR),
      // [BondName.SOLACE_ETH_SLP]: String(process.env.REACT_APP_RINKEBY_SOLACE_ETH_SLP_TELLER_ADDR),
      [BondName.USDC]: String(process.env.REACT_APP_RINKEBY_USDC_TELLER_ADDR),
      [BondName.SOLACE_USDC_SLP]: String(process.env.REACT_APP_RINKEBY_SOLACE_USDC_SLP_TELLER_ADDR),
      [BondName.SCP]: String(process.env.REACT_APP_RINKEBY_SCP_TELLER_ADDR),
      [BondName.WBTC]: String(process.env.REACT_APP_RINKEBY_WBTC_TELLER_ADDR),
      [BondName.USDT]: String(process.env.REACT_APP_RINKEBY_USDT_TELLER_ADDR),
    },
  },
  cache: {
    supportedProducts: [CompoundProduct, WaaveProduct, LiquityProduct],
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(4),
    chainName: 'Rinkeby Testnet',
    nativeCurrency: { name: 'Ether', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://eth-rinkeby.alchemyapi.io'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
