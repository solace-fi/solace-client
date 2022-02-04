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
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import riskManagerABI from '../constants/abi/contracts/RiskManager.sol/RiskManager.json'
/* product contract abi */
import aaveABI from '../constants/abi/contracts/products/AaveV2Product.sol/AaveV2Product.json'
import waaveABI from '../constants/abi/contracts/products/WaaveProduct.sol/WaaveProduct.json'

/* product objects */
import { AaveProduct } from '../products/aave'
import { WaaveProduct } from '../products/waave'

import { KEY_ADDRS, PRODUCT_ADDRS, TELLER_ADDRS_V1, TELLER_ADDRS_V2 } from '../constants/addresses/kovan'
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
import bondTellerErc20Abi_V1 from '../constants/abi/contracts/BondTellerErc20.sol/BondTellerErc20.json'
import bondTellerErc20Abi_V2 from '../constants/metadata/BondTellerErc20_V2.json'
import bondTellerEthAbi_V1 from '../constants/abi/contracts/BondTellerEth.sol/BondTellerEth.json'
import bondTellerEthAbi_V2 from '../constants/metadata/BondTellerEth_V2.json'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import weth9 from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import sushiswapLpAbi from '../constants/metadata/ISushiswapMetadataAlt.json'

/*

When adding new products, please add into productContracts, functions, and cache

*/

const chainId = 42

const tellerToTokenMapping: {
  [key: string]: TellerToken
} = {
  [TELLER_ADDRS_V1.DAI_TELLER]: {
    addr: DAI_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: DAI_ADDRESS[1],
    tokenId: 'dai',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.ETH_TELLER]: {
    addr: WETH9_ADDRESS[chainId],
    principalAbi: weth9,
    tellerAbi: bondTellerEthAbi_V1,
    mainnetAddr: WETH9_ADDRESS[1],
    tokenId: 'ethereum',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDC_TELLER]: {
    addr: USDC_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: USDC_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER]: {
    addr: SOLACE_USDC_SLP_ADDRESS[chainId],
    principalAbi: sushiswapLpAbi,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: SOLACE_USDC_SLP_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: true,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.SCP_TELLER]: {
    addr: SCP_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: SCP_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.WBTC_TELLER]: {
    addr: WBTC_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: WBTC_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V1.USDT_TELLER]: {
    addr: USDT_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V1,
    mainnetAddr: USDT_ADDRESS[1],
    tokenId: 'tether',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 1,
  },
  [TELLER_ADDRS_V2.DAI_TELLER]: {
    addr: DAI_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: DAI_ADDRESS[1],
    tokenId: 'dai',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.ETH_TELLER]: {
    addr: WETH9_ADDRESS[chainId],
    principalAbi: weth9,
    tellerAbi: bondTellerEthAbi_V2.abi,
    mainnetAddr: WETH9_ADDRESS[1],
    tokenId: 'ethereum',
    isBondTellerErc20: false,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDC_TELLER]: {
    addr: USDC_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: USDC_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.SCP_TELLER]: {
    addr: SCP_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: SCP_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.WBTC_TELLER]: {
    addr: WBTC_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: WBTC_ADDRESS[1],
    tokenId: '',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.USDT_TELLER]: {
    addr: USDT_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: USDT_ADDRESS[1],
    tokenId: 'tether',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
  [TELLER_ADDRS_V2.FRAX_TELLER]: {
    addr: FRAX_ADDRESS[chainId],
    principalAbi: ierc20Json.abi,
    tellerAbi: bondTellerErc20Abi_V2.abi,
    mainnetAddr: FRAX_ADDRESS[1],
    tokenId: 'frax',
    isBondTellerErc20: true,
    isLp: false,
    isDisabled: false,
    version: 2,
  },
}

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
    bondTellerContracts: {
      [BondName.DAI]: [TELLER_ADDRS_V1.DAI_TELLER, TELLER_ADDRS_V2.DAI_TELLER],
      [BondName.ETH]: [TELLER_ADDRS_V1.ETH_TELLER, TELLER_ADDRS_V2.ETH_TELLER],
      [BondName.USDC]: [TELLER_ADDRS_V1.USDC_TELLER, TELLER_ADDRS_V2.USDC_TELLER],
      [BondName.SOLACE_USDC_SLP]: [TELLER_ADDRS_V1.SOLACE_USDC_SLP_TELLER],
      [BondName.SCP]: [TELLER_ADDRS_V1.SCP_TELLER, TELLER_ADDRS_V2.SCP_TELLER],
      [BondName.WBTC]: [TELLER_ADDRS_V1.WBTC_TELLER, TELLER_ADDRS_V2.WBTC_TELLER],
      [BondName.USDT]: [TELLER_ADDRS_V1.USDT_TELLER, TELLER_ADDRS_V2.USDT_TELLER],
      [BondName.FRAX]: [TELLER_ADDRS_V2.FRAX_TELLER],
      // [BondName.SOLACE_DAI_SLP]: TELLER_ADDRS_V1.SOLACE_DAI_SLP_TELLER,
      // [BondName.SOLACE_ETH_SLP]: TELLER_ADDRS_V1.SOLACE_ETH_SLP_TELLER,
    },
    restrictedFeatures: {},
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
