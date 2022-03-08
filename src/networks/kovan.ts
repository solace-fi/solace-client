import { ProductName, Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
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
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import riskManagerABI from '../constants/abi/contracts/RiskManager.sol/RiskManager.json'
/* product contract abi */
import aaveABI from '../constants/abi/contracts/products/AaveV2Product.sol/AaveV2Product.json'
import waaveABI from '../constants/abi/contracts/products/WaaveProduct.sol/WaaveProduct.json'

/* product objects */
import { AaveProduct } from '../products/aave'
import { WaaveProduct } from '../products/waave'

import { KEY_ADDRS, PRODUCT_ADDRS } from '../constants/addresses/kovan'
import { WETH9_ADDRESS } from '../constants/mappings/tokenAddressMapping'
import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/kovan'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const chainId = 42

export const KovanNetwork: NetworkConfig = {
  name: 'Kovan',
  chainId: chainId,
  isTestnet: true,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: WETH9_ADDRESS[1], symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://eth-kovan.alchemyapi.io/v2/${String(ALCHEMY_ETHEREUM_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 1,
  },
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
    restrictedFeatures: { noSoteria: true },
    specialFeatures: {},
    specialContracts: {},
  },
  cache: {
    supportedProducts: [AaveProduct, WaaveProduct],
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(chainId),
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
