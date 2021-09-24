import { BigNumber } from 'ethers'
import { PolicyState, ProductName, TransactionCondition, Unit, SystemNotice, Error } from '../constants/enums'
import { Contract } from '@ethersproject/contracts'

export type NetworkCache = {
  name: string
  chainId: number
  positions: { [key: string]: { savedPositions: Position[]; positionsInitialized: boolean } }
  positionNames: { [key: string]: { positionNames: { [key: string]: string }; positionNamesInitialized: boolean } }
}

export type ClaimDetails = { id: string; cooldown: string; canWithdraw: boolean; amount: BigNumber }

export type Policy = {
  policyId: number
  policyHolder: string
  productAddress: string
  productName: string
  positionDescription: string
  positionNames: string[]
  expirationBlock: number
  coverAmount: string
  price: string
  status: PolicyState
  claimAssessment?: ClaimAssessment
}

export type TokenInfo = {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: BigNumber
}

export type LpTokenInfo = {
  id: BigNumber
  value: BigNumber
}

export type Position = {
  type: PositionsType
  position: Token | LiquityPosition
}

export type Token = {
  token: {
    address: string
    name: string
    symbol: string
    decimals: number
    balance: BigNumber
  }
  underlying: {
    address: string
    name: string
    symbol: string
    decimals: number
    balance: BigNumber
  }
  eth: {
    balance: BigNumber
  }
}

export type LiquityPosition = {
  positionName: string
  positionAddress: string
  amount: BigNumber
  associatedToken: {
    address: string
    name: string
    symbol: string
  }
}

export type ClaimAssessment = {
  lossEventDetected: boolean
  amountOut: string
  deadline: string
  msgHash: string
  signature: string
}

export type GasFeeListState = {
  options: GasFeeOption[]
  loading: boolean
  selected?: GasFeeOption
  suggestedBaseFee?: number
}

export type GasFeeOption = {
  key: string
  name: string
  value: number
}

export type GasPriceResult = {
  veryFast: number
  fast: number
  average: number
  safeLow: number
  suggestBaseFee?: number
}

export type PositionsType = 'erc20' | 'liquity' | 'other'

export type StringToStringMapping = { [key: string]: string }

export type SupportedProduct = {
  name: ProductName
  positionsType: PositionsType
  productLink?: string

  getAppraisals: (tokens: any[], chainId: number) => Promise<BigNumber[]>
  getTokens?: (provider: any, activeNetwork: NetworkConfig) => Promise<Token[]>
  getBalances?: (
    user: string,
    provider: any,
    cache: NetworkCache,
    activeNetwork: NetworkConfig,
    tokens: Token[]
  ) => Promise<Token[]>
  getPositions?: any
}

export type ProductContract = {
  name: ProductName
  contract?: Contract
}

export type ContractSources = { addr: string; abi: any }

export type WindowDimensions = {
  width: number
  height: number
}

export type LocalTx = {
  hash: any
  type: string
  value: string
  status: TransactionCondition
  unit: Unit
}

export type NetworkConfig = {
  name: string
  chainId: number
  isTestnet: boolean
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
    keyContracts: {
      [key: string]: ContractSources
    }
    productContracts: {
      [key: string]: ContractSources
    }
    productsRev: {
      [key: string]: ProductName
    }
  }
  cache: {
    supportedProducts: SupportedProduct[]
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

export type ErrorData = {
  type: Error
  metadata: string
  uniqueId: string
}

export type SystemNoticeData = {
  type: SystemNotice
  metadata: string
  uniqueId: string
}
