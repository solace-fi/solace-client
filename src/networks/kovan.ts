import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import wethABI from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import lpFarmABI from '../constants/abi/contracts/SolaceEthLpFarm.sol/SolaceEthLpFarm.json'
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import lpAppraisorABI from '../constants/abi/contracts/LpAppraisor.sol/LpAppraisor.json'
import riskManagerABI from '../constants/abi/contracts/RiskManager.sol/RiskManager.json'

import aaveABI from '../constants/abi/contracts/products/AaveV2Product.sol/AaveV2Product.json'
import waaveABI from '../constants/abi/contracts/products/WaaveProduct.sol/WaaveProduct.json'

import { ProductName, Unit } from '../constants/enums'

import { NetworkConfig } from '../constants/types'
import { ETHERSCAN_API_KEY } from '../constants'
import { hexValue } from '@ethersproject/bytes'
import { ALCHEMY_API_KEY } from '../constants'
import { AaveProduct } from '../products/aave'
import { WaaveProduct } from '../products/waave'

/*

When adding new products, please add into productContracts, functions, and cache

*/

export const KovanNetwork: NetworkConfig = {
  name: 'kovan',
  chainId: 42,
  isTestnet: true,
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
      String(process.env.REACT_APP_KOVAN_WAAVE_PRODUCT_ADDR),
      String(process.env.REACT_APP_KOVAN_LPFARM_ADDR),
      String(process.env.REACT_APP_KOVAN_SOLACE_ADDR),
    ],
  },
  config: {
    keyContracts: {
      master: {
        addr: String(process.env.REACT_APP_KOVAN_MASTER_ADDR),
        abi: masterABI,
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
      cpFarm: {
        addr: String(process.env.REACT_APP_KOVAN_CPFARM_ADDR),
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: String(process.env.REACT_APP_KOVAN_LPFARM_ADDR),
        abi: lpFarmABI,
      },
      registry: {
        addr: String(process.env.REACT_APP_KOVAN_REGISTRY_ADDR),
        abi: registryABI,
      },
      lpToken: {
        addr: String(process.env.REACT_APP_KOVAN_UNISWAP_LPTOKEN_ADDR),
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: String(process.env.REACT_APP_KOVAN_WETH_ADDR),
        abi: wethABI,
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
        abi: lpAppraisorABI,
      },
      riskManager: {
        addr: String(process.env.REACT_APP_KOVAN_RISK_MANAGER_ADDR),
        abi: riskManagerABI,
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
    productsRev: {
      [String(process.env.REACT_APP_KOVAN_AAVE_PRODUCT_ADDR)]: ProductName.AAVE,
      [String(process.env.REACT_APP_KOVAN_WAAVE_PRODUCT_ADDR)]: ProductName.WAAVE,
    },
  },
  cache: {
    supportedProducts: [AaveProduct, WaaveProduct],
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
    trezorAppUrl: 'https://polygon.solace.fi/',
  },
}
