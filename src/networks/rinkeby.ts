import { Unit } from '../constants/enums'
import { NetworkConfig } from '../constants/types'
import { ETHERSCAN_API_KEY, ALCHEMY_ETHEREUM_API_KEY } from '../constants'
import { hexValue } from '@ethersproject/bytes'
import EthereumLogo from '../resources/svg/networks/ethereum-logo.svg'

/*  core contract abi */
import farmControllerABI from '../constants/abi/FarmController.json'
import farmRewardsABI from '../constants/abi/FarmRewardsV2.json'
import solaceABI from '../constants/abi/SOLACE.json'
import xSolaceABI from '../constants/abi/xSOLACE.json'
import xSolaceV1ABI from '../constants/abi/xSOLACEV1.json'
import xSolaceMigratorABI from '../constants/abi/xSolaceMigrator.json'
import cpFarmABI from '../constants/abi/CpFarm.json'

import { KEY_ADDRS } from '../constants/addresses/rinkeby'
import { USDC_TOKEN, WETH9_TOKEN } from '../constants/mappings/token'
import { tellerToTokenMapping } from '../constants/mappings/tellerToTokenMappings/rinkeby'
import {
  COVER_PAYMENT_MANAGER_ADDRESS,
  SOLACE_COVER_PRODUCT_V3_ADDRESS,
  STAKING_REWARDS_V2_ADDRESS,
} from '@solace-fi/sdk-nightly'

import {
  Vault_ABI,
  xsLocker_ABI,
  StakingRewards_ABI,
  SolaceCoverProduct_ABI,
  SolaceCoverProductV3_ABI,
  CoverPaymentManager_ABI,
  StakingRewardsV2_ABI,
} from '../constants/abi'

const chainId = 4

export const RinkebyNetwork: NetworkConfig = {
  name: 'Rinkeby',
  chainId: chainId,
  isTestnet: true,
  logo: EthereumLogo,
  supportedTxTypes: [0, 2],
  nativeCurrency: { mainnetReference: WETH9_TOKEN.address[1], symbol: Unit.ETH, decimals: 18 },
  rpc: {
    httpsUrl: `https://eth-rinkeby.alchemyapi.io/v2/${String(ALCHEMY_ETHEREUM_API_KEY)}`,
    pollingInterval: 12_000,
    blockConfirms: 1,
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
        abi: Vault_ABI,
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
        abi: xsLocker_ABI,
      },
      stakingRewards: {
        addr: KEY_ADDRS.STAKING_REWARDS,
        abi: StakingRewards_ABI,
      },
      xSolaceMigrator: {
        addr: KEY_ADDRS.XSOLACE_MIGRATOR,
        abi: xSolaceMigratorABI.abi,
      },
      cpFarm: {
        addr: KEY_ADDRS.CPFARM,
        abi: cpFarmABI,
      },
      solaceCoverProduct: {
        addr: KEY_ADDRS.SOLACE_COVER_PRODUCT,
        abi: SolaceCoverProduct_ABI,
      },
      solaceCoverProductV3: {
        addr: SOLACE_COVER_PRODUCT_V3_ADDRESS[chainId],
        abi: SolaceCoverProductV3_ABI,
      },
      coverPaymentManager: {
        addr: COVER_PAYMENT_MANAGER_ADDRESS[chainId],
        abi: CoverPaymentManager_ABI,
      },
      stakingRewardsV2: {
        addr: STAKING_REWARDS_V2_ADDRESS[chainId],
        abi: StakingRewardsV2_ABI,
      },
    },
    restrictedFeatures: {},
    specialFeatures: {
      solaceBuyLink: `https://app.sushi.com/swap?inputCurrency=${USDC_TOKEN.address[chainId]}&outputCurrency=${KEY_ADDRS.SOLACE}`,
    },
    specialContracts: {},
  },
  cache: {
    tellerToTokenMapping,
  },
  metamaskChain: {
    chainId: hexValue(chainId),
    chainName: 'Rinkeby Testnet',
    nativeCurrency: { name: 'Ether', symbol: Unit.ETH, decimals: 18 },
    rpcUrls: ['https://rinkeby.infura.io/v3/'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
  },
  walletConfig: {
    portisId: String(process.env.REACT_APP_PORTIS_ID),
    trezorEmail: '',
    trezorAppUrl: String(process.env.REACT_APP_WEBSITE_LINK),
  },
}
