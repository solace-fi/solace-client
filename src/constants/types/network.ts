import { ContractSources } from './contract'
import { Unit } from '../enums'
import { TellerTokenMetadata } from '.'

export type NetworkConfig = {
  name: string
  chainId: number
  isTestnet: boolean
  logo?: string
  supportedTxTypes: number[]
  nativeCurrency: {
    mainnetReference: string
    symbol: Unit
    decimals: number
  }
  rpc: {
    httpsUrl: string
    pollingInterval: number
    blockConfirms: number
  }
  explorer: {
    name: string
    key?: string
    url: string
    apiUrl: string
    excludedContractAddrs: string[]
  }
  config: {
    keyContracts: { [key: string]: ContractSources }
    specialContracts: { [key: string]: ContractSources }
    restrictedFeatures: {
      noBondingV1?: boolean
      noBondingV2?: boolean
      noFarmingV1?: boolean
      noSoteria?: boolean
      noCoverageV3?: boolean
      noStakingV1?: boolean
      noStakingV2?: boolean
      noStakingRewardsV2?: boolean
    }
    specialFeatures: {
      solaceBuyLink?: string
      unwrapBridgedSolace?: boolean
      hardcodedGasPrice?: number
      hardcodedMaxFeePerGas?: number
      hardcodedMaxPriorityFeePerGas?: number
    }
    underwritingPoolAddr?: string
  }
  cache: {
    tellerToTokenMapping: {
      [key: string]: TellerTokenMetadata
    }
  }
  metamaskChain?: MetamaskAddEthereumChain
  walletConfig: any
}

export type MetamaskAddEthereumChain = {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}
