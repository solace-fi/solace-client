import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { ETHERSCAN_API_KEY, ALCHEMY_API_KEY } from '../constants'
import { ProductName, Unit } from '../constants/enums'
import { hexValue } from '@ethersproject/bytes'
import { NetworkConfig } from '../constants/types'

/* core contract abi */
import farmControllerABI from '../constants/abi/contracts/FarmController.sol/FarmController.json'
import optionsFarmingABI from '../constants/abi/contracts/OptionsFarming.sol/OptionsFarming.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import wethABI from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'
import lpAppraisorABI from '../constants/abi/contracts/LpAppraisor.sol/LpAppraisor.json'
import riskManagerABI from '../constants/abi/contracts/RiskManager.sol/RiskManager.json'

/* product contract abi */

/* product objects */

/*

When adding new products, please add into productContracts, functions, and cache

*/

export const MainNetwork: NetworkConfig = {
  name: 'mainnet',
  chainId: 1,
  isTestnet: false,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { symbol: Unit.ETH, decimals: 18 },
  rpc: { httpsUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`, pollingInterval: 12_000 },
  explorer: {
    name: 'Etherscan',
    key: String(ETHERSCAN_API_KEY),
    url: 'https://etherscan.io',
    apiUrl: 'https://api.etherscan.io',
    excludedContractAddrs: [],
  },
  config: {
    keyContracts: {
      farmController: {
        addr: String(process.env.REACT_APP_MAINNET_FARM_CONTROLLER_ADDR),
        abi: farmControllerABI,
      },
      optionsFarming: {
        addr: String(process.env.REACT_APP_MAINNET_OPTIONS_FARMING_ADDR),
        abi: optionsFarmingABI,
      },
      vault: {
        addr: String(process.env.REACT_APP_MAINNET_VAULT_ADDR),
        abi: vaultABI,
      },
      treasury: {
        addr: String(process.env.REACT_APP_MAINNET_TREASURY_ADDR),
        abi: treasuryABI,
      },
      solace: {
        addr: String(process.env.REACT_APP_MAINNET_SOLACE_ADDR),
        abi: solaceABI,
      },
      cpFarm: {
        addr: String(process.env.REACT_APP_MAINNET_CPFARM_ADDR),
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: String(process.env.REACT_APP_MAINNET_LPFARM_ADDR),
        abi: null,
      },
      registry: {
        addr: String(process.env.REACT_APP_MAINNET_REGISTRY_ADDR),
        abi: registryABI,
      },
      lpToken: {
        addr: String(process.env.REACT_APP_MAINNET_UNISWAP_LPTOKEN_ADDR),
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: String(process.env.REACT_APP_MAINNET_WETH_ADDR),
        abi: wethABI,
      },
      claimsEscrow: {
        addr: String(process.env.REACT_APP_MAINNET_CLAIMS_ESCROW_ADDR),
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: String(process.env.REACT_APP_MAINNET_POLICY_MANAGER_ADDR),
        abi: polMagABI,
      },
      lpAppraisor: {
        addr: String(process.env.REACT_APP_MAINNET_LPAPPRAISOR_ADDR),
        abi: lpAppraisorABI,
      },
      riskManager: {
        addr: String(process.env.REACT_APP_MAINNET_RISK_MANAGER_ADDR),
        abi: riskManagerABI,
      },
    },
    productContracts: {},
    productsRev: {},
  },
  cache: {
    supportedProducts: [],
  },
  metamaskChain: {
    chainId: hexValue(1),
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://eth-mainnet.alchemyapi.io'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
