import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import wethABI from '../constants/abi/contracts/mocks/WETH9.sol/WETH9.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import lpFarmABI from '../constants/abi/contracts/SolaceEthLpFarm.sol/SolaceEthLpFarm.json'
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import aaveAbi from '../constants/abi/contracts/products/AaveV2Product.sol/AaveV2Product.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import lpAppraisorABI from '../constants/abi/contracts/LpAppraisor.sol/LpAppraisor.json'

import { ProductName } from '../constants/enums'
import { getTokens as aaveTokens } from '../utils/positionGetters/aave/getTokens'
import { getBalances as aaveBalances } from '../utils/positionGetters/aave/getBalances'

import { NetworkConfig } from '../constants/types'

export const KovanNetwork: NetworkConfig = {
  chainId: 42,
  config: {
    keyContracts: {
      master: {
        addr: process.env.REACT_APP_KOVAN_MASTER_ADDR,
        abi: masterABI,
      },
      vault: {
        addr: process.env.REACT_APP_KOVAN_VAULT_ADDR,
        abi: vaultABI,
      },
      treasury: {
        addr: process.env.REACT_APP_KOVAN_TREASURY_ADDR,
        abi: treasuryABI,
      },
      solace: {
        addr: process.env.REACT_APP_KOVAN_SOLACE_ADDR,
        abi: solaceABI,
      },
      cpFarm: {
        addr: process.env.REACT_APP_KOVAN_CPFARM_ADDR,
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: process.env.REACT_APP_KOVAN_LPFARM_ADDR,
        abi: lpFarmABI,
      },
      registry: {
        addr: process.env.REACT_APP_KOVAN_REGISTRY_ADDR,
        abi: registryABI,
      },
      lpToken: {
        addr: process.env.REACT_APP_KOVAN_UNISWAP_LPTOKEN_ADDR,
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: process.env.REACT_APP_KOVAN_WETH_ADDR,
        abi: wethABI,
      },
      claimsEscrow: {
        addr: process.env.REACT_APP_KOVAN_CLAIMS_ESCROW_ADDR,
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: process.env.REACT_APP_KOVAN_POLICY_MANAGER_ADDR,
        abi: polMagABI,
      },
      lpAppraisor: {
        addr: process.env.REACT_APP_KOVAN_LPAPPRAISOR_ADDR,
        abi: lpAppraisorABI,
      },
    },
    productContracts: {
      [ProductName.AAVE]: {
        addr: process.env.REACT_APP_KOVAN_AAVE_PRODUCT_ADDR,
        abi: aaveAbi,
      },
    },
  },
  cache: {
    supportedProducts: [{ name: ProductName.AAVE }],
    productsRev: {
      [String(process.env.REACT_APP_KOVAN_AAVE_PRODUCT_ADDR)]: ProductName.AAVE,
    },
    tokens: { [ProductName.AAVE]: { getTokens: aaveTokens, savedTokens: [], tokensInitialized: false } },
    getBalances: { [ProductName.AAVE]: aaveBalances },
    positions: { [ProductName.AAVE]: { positionNamesInitialized: false } },
  },
}
