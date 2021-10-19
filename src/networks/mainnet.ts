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

import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'
import { ETHERSCAN_API_KEY, ALCHEMY_API_KEY } from '../constants'
import { ProductName, Unit } from '../constants/enums'
import { hexValue } from '@ethersproject/bytes'

export const MainNetwork = {
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
    keyContracts: {},
    productContracts: {},
  },
  cache: {},
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
    trezorAppUrl: 'https://polygon.solace.fi/',
  },
}
