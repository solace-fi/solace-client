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
import compAbi from '../constants/abi/contracts/products/CompoundProductRinkeby.sol/CompoundProductRinkeby.json'
import aaveAbi from '../constants/abi/contracts/products/AaveV2Product.sol/AaveV2Product.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import lpAppraisorABI from '../constants/abi/contracts/LpAppraisor.sol/LpAppraisor.json'

import { ProductName } from '../constants/enums'
import { getTokens as comp1Tokens } from '../utils/positionGetters/compound/mainnet/getTokens'
import { getBalances as comp1Balances } from '../utils/positionGetters/compound/mainnet/getBalances'
import { getTokens as comp4Tokens } from '../utils/positionGetters/compound/rinkeby/getTokens'
import { getBalances as comp4Balances } from '../utils/positionGetters/compound/rinkeby/getBalances'
import { getTokens as aave42Tokens } from '../utils/positionGetters/aave/getTokens'
import { getBalances as aave42Balances } from '../utils/positionGetters/aave/getBalances'

export const contractConfig: any = {
  '4': {
    keyContracts: {
      master: {
        addr: process.env.REACT_APP_RINKEBY_MASTER_ADDR,
        abi: masterABI,
      },
      vault: {
        addr: process.env.REACT_APP_RINKEBY_VAULT_ADDR,
        abi: vaultABI,
      },
      treasury: {
        addr: process.env.REACT_APP_RINKEBY_TREASURY_ADDR,
        abi: treasuryABI,
      },
      solace: {
        addr: process.env.REACT_APP_RINKEBY_SOLACE_ADDR,
        abi: solaceABI,
      },
      cpFarm: {
        addr: process.env.REACT_APP_RINKEBY_CPFARM_ADDR,
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: process.env.REACT_APP_RINKEBY_LPFARM_ADDR,
        abi: lpFarmABI,
      },
      registry: {
        addr: process.env.REACT_APP_RINKEBY_REGISTRY_ADDR,
        abi: registryABI,
      },
      lpToken: {
        addr: process.env.REACT_APP_RINKEBY_UNISWAP_LPTOKEN_ADDR,
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: process.env.REACT_APP_RINKEBY_WETH_ADDR,
        abi: wethABI,
      },
      claimsEscrow: {
        addr: process.env.REACT_APP_RINKEBY_CLAIMS_ESCROW_ADDR,
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: process.env.REACT_APP_RINKEBY_POLICY_MANAGER_ADDR,
        abi: polMagABI,
      },
      lpAppraisor: {
        addr: process.env.REACT_APP_RINKEBY_LPAPPRAISOR_ADDR,
        abi: lpAppraisorABI,
      },
    },
    productContracts: {
      [ProductName.COMPOUND]: {
        addr: process.env.REACT_APP_RINKEBY_COMPOUND_PRODUCT_ADDR,
        abi: compAbi,
      },
    },
  },
  '42': {
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
}

export const policyConfig: any = {
  '4': {
    supportedProducts: [{ name: ProductName.COMPOUND }],
    productsRev: {
      [String(process.env.REACT_APP_RINKEBY_COMPOUND_PRODUCT_ADDR)]: ProductName.COMPOUND,
    },
    tokens: { [ProductName.COMPOUND]: { getTokens: comp4Tokens, savedTokens: [], tokensInitialized: false } },
    getBalances: { [ProductName.COMPOUND]: comp4Balances },
    positions: { [ProductName.COMPOUND]: { positionNamesInitialized: false } },
  },
  '42': {
    supportedProducts: [{ name: ProductName.AAVE }],
    productsRev: {
      [String(process.env.REACT_APP_KOVAN_AAVE_PRODUCT_ADDR)]: ProductName.AAVE,
    },
    tokens: { [ProductName.AAVE]: { getTokens: aave42Tokens, savedTokens: [], tokensInitialized: false } },
    getBalances: { [ProductName.AAVE]: aave42Balances },
    positions: { [ProductName.AAVE]: { positionNamesInitialized: false } },
  },
}
