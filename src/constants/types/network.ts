import { ContractSources } from './contract'
import { Unit } from '../enums'

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
    generalFeatures: {
      native?: boolean
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
