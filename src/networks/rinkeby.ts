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

import { KEY_ADDRS, PRODUCT_ADDRS, TELLER_ADDRS_V1, TELLER_ADDRS_V2 } from '../constants/addresses/rinkeby'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS_V1.DAI_TELLER]: {
    addr: '0xE28bEf39f41c63B66cFD97BFfDB6Defc915B3C88',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.ETH_TELLER]: {
    addr: '0xc778417e063141139fce010982780140aa0cd5ab',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDC_TELLER]: {
    addr: '0x6D6DC3A8f02a1fEc0B9575e8dDE4135929Bd6e21',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER]: {
    addr: '0x7bec68fb902f90ba84634e764c91fdffca04d084',
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
    addr: '0x20fb9cddbca5a5eb468c76010aec6ed4eacc037f',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDT_TELLER]: {
    addr: '0x638b7BaA3D0C7d235fb904B01523883F980f24Ce',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V2.DAI_TELLER]: {
    addr: '0xE28bEf39f41c63B66cFD97BFfDB6Defc915B3C88',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.ETH_TELLER]: {
    addr: '0xc778417e063141139fce010982780140aa0cd5ab',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDC_TELLER]: {
    addr: '0x6D6DC3A8f02a1fEc0B9575e8dDE4135929Bd6e21',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.SCP_TELLER]: {
    addr: '0x501acee83a6f269b77c167c6701843d454e2efa0',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WBTC_TELLER]: {
    addr: '0x20fb9cddbca5a5eb468c76010aec6ed4eacc037f',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDT_TELLER]: {
    addr: '0x638b7BaA3D0C7d235fb904B01523883F980f24Ce',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
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
      [BondName.DAI]: [TELLER_ADDRS_V1.DAI_TELLER, TELLER_ADDRS_V2.DAI_TELLER],
      [BondName.ETH]: [TELLER_ADDRS_V1.ETH_TELLER, TELLER_ADDRS_V2.ETH_TELLER],
      [BondName.USDC]: [TELLER_ADDRS_V1.USDC_TELLER, TELLER_ADDRS_V2.USDC_TELLER],
      [BondName.SOLACE_USDC_SLP]: [TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER],
      [BondName.SCP]: [TELLER_ADDRS_V1.SCP_TELLER, TELLER_ADDRS_V2.SCP_TELLER],
      [BondName.WBTC]: [TELLER_ADDRS_V1.WBTC_TELLER, TELLER_ADDRS_V2.WBTC_TELLER],
      [BondName.USDT]: [TELLER_ADDRS_V1.USDT_TELLER, TELLER_ADDRS_V2.USDT_TELLER],
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
