import { ContractSources } from './contract'
import { Position } from './position'
import { SupportedProduct } from './product'
import { Unit } from '../enums'

export type NetworkConfig = {
  name: string
  chainId: number
  isTestnet: boolean
  logo: string
  supportedTxTypes: number[]
  nativeCurrency: {
    symbol: Unit
    decimals: number
  }
  rpc: {
    httpsUrl: string
    pollingInterval: number
  }
  explorer: {
    name: 'Etherscan' | 'Polygonscan'
    key: string
    url: string
    apiUrl: string
    excludedContractAddrs: string[]
  }
  config: {
    keyContracts: { [key: string]: ContractSources }
    productContracts: { [key: string]: ContractSources }
    bondTellerContracts: { [key: string]: string }
  }
  cache: {
    supportedProducts: SupportedProduct[]
    tellerToTokenMapping: {
      [key: string]: { addr: string; isBondTellerErc20: boolean; isLp: boolean }
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

export type MetamaskSwitchEthereumChain = {
  chainId: string
}

export type MetamaskWatchAsset = {
  type: string
  options: {
    address: string
    symbol: string
    decimals: number
  }
}

export type NetworkCache = {
  chainId: number
  positionsCache: PositionsCache
  positionNamesCache: PositionNamesCache
}

export type PositionsCache = { [key: string]: PositionsCacheValue }

export type PositionNamesCache = {
  [key: string]: PositionNamesCacheValue
}

export type PositionsCacheValue = { positions: Position[] }

export type PositionNamesCacheValue = {
  positionNames: { [key: string]: string }
  underlyingPositionNames: { [key: string]: string[] }
}
