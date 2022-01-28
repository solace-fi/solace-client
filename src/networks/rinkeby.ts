import { BondName, ProductName, Unit } from '../constants/enums'
import { NetworkConfig, TellerToken } from '../constants/types'
import { ETHERSCAN_API_KEY, ALCHEMY_ETHEREUM_API_KEY } from '../constants'
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

import { KEY_ADDRS, PRODUCT_ADDRS, TELLER_ADDRS } from '../constants/addresses/rinkeby'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS.DAI_TELLER]: {
    addr: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS.ETH_TELLER]: {
    addr: '0xc778417e063141139fce010982780140aa0cd5ab',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS.USDC_TELLER]: {
    addr: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS.SOLACE_USDC_SLP_TELLER]: {
    addr: '0x7bec68fb902f90ba84634e764c91fdffca04d084',
    isBondTellerErc20: true,
    isLp: true,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS.SCP_TELLER]: {
    addr: '0x501acee83a6f269b77c167c6701843d454e2efa0',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS.WBTC_TELLER]: {
    addr: '0x20fb9cddbca5a5eb468c76010aec6ed4eacc037f',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS.USDT_TELLER]: {
    addr: '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  // [TELLER_ADDRS.SOLACE_ETH_SLP_TELLER]: {
  //   addr: '0x66844fbeb515f3da46c6129fe911f0cb436ba2e0',
  //   isBondTellerErc20: true,
  //   isLp: true,
  // },
  // [TELLER_ADDRS.SOLACE_DAI_SLP_TELLER]: {
  //   addr: '0xf57fec00d4712e68fb0bceac77a2841edd7a155e',
  //   isBondTellerErc20: true,
  //   isLp: true,
  // },
}

export const RinkebyNetwork: NetworkConfig = {
  name: 'Rinkeby',
  chainId: 4,
  isTestnet: true,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://eth-rinkeby.alchemyapi.io/v2/${String(ALCHEMY_ETHEREUM_API_KEY)}`,
    pollingInterval: 12_000,
  },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://rinkeby.etherscan.io',
    apiUrl: 'https://api-rinkeby.etherscan.io',
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
      [ProductName.COMPOUND]: {
        addr: PRODUCT_ADDRS.COMPOUND_PRODUCT,
        abi: compABI,
      },
      [ProductName.WAAVE]: {
        addr: PRODUCT_ADDRS.WAAVE_PRODUCT,
        abi: waaveABI,
      },
      [ProductName.LIQUITY]: {
        addr: PRODUCT_ADDRS.LIQUITY_PRODUCT,
        abi: liquityProductABI,
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
    availableFeatures: {
      bondingV1: true,
      bondingV2: true,
      stakingV1: true,
      stakingV2: true,
      farmingV1: true,
      coverProducts: true,
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
