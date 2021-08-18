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
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import lpAppraisorABI from '../constants/abi/contracts/LpAppraisor.sol/LpAppraisor.json'

import { ProductName, Unit } from '../constants/enums'
import { getTokens as compTokens } from '../utils/positionGetters/compound/getTokens'
import { getBalances as compBalances } from '../utils/positionGetters/compound/getBalances'

import { NetworkConfig } from '../constants/types'
import { ETHERSCAN_API_KEY } from '../constants'
import { hexValue } from '@ethersproject/bytes'
import { ALCHEMY_API_KEY } from '../constants'

export const RinkebyNetwork: NetworkConfig = {
  name: 'rinkeby',
  chainId: 4,
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: { httpsUrl: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}` },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://rinkeby.etherscan.io',
    apiUrl: 'https://api-rinkeby.etherscan.io',
  },
  config: {
    keyContracts: {
      master: {
        addr: String(process.env.REACT_APP_RINKEBY_MASTER_ADDR),
        abi: masterABI,
      },
      vault: {
        addr: String(process.env.REACT_APP_RINKEBY_VAULT_ADDR),
        abi: vaultABI,
      },
      treasury: {
        addr: String(process.env.REACT_APP_RINKEBY_TREASURY_ADDR),
        abi: treasuryABI,
      },
      solace: {
        addr: String(process.env.REACT_APP_RINKEBY_SOLACE_ADDR),
        abi: solaceABI,
      },
      cpFarm: {
        addr: String(process.env.REACT_APP_RINKEBY_CPFARM_ADDR),
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: String(process.env.REACT_APP_RINKEBY_LPFARM_ADDR),
        abi: lpFarmABI,
      },
      registry: {
        addr: String(process.env.REACT_APP_RINKEBY_REGISTRY_ADDR),
        abi: registryABI,
      },
      lpToken: {
        addr: String(process.env.REACT_APP_RINKEBY_UNISWAP_LPTOKEN_ADDR),
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: String(process.env.REACT_APP_RINKEBY_WETH_ADDR),
        abi: wethABI,
      },
      claimsEscrow: {
        addr: String(process.env.REACT_APP_RINKEBY_CLAIMS_ESCROW_ADDR),
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: String(process.env.REACT_APP_RINKEBY_POLICY_MANAGER_ADDR),
        abi: polMagABI,
      },
      lpAppraisor: {
        addr: String(process.env.REACT_APP_RINKEBY_LPAPPRAISOR_ADDR),
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
  cache: {
    supportedProducts: [{ name: ProductName.COMPOUND, contract: null }],
    productsRev: {
      [String(process.env.REACT_APP_RINKEBY_COMPOUND_PRODUCT_ADDR)]: ProductName.COMPOUND,
    },
    tokens: { [ProductName.COMPOUND]: { getTokens: compTokens, savedTokens: [], tokensInitialized: false } },
    getBalances: { [ProductName.COMPOUND]: compBalances },
    positions: { [ProductName.COMPOUND]: { positionNamesInitialized: false } },
  },
  metamaskChain: {
    chainId: hexValue(4),
    chainName: 'Rinkeby Testnet',
    nativeCurrency: { name: 'Ethereum', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://eth-rinkeby.alchemyapi.io'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
  },
}
