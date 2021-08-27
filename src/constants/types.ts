import { BigNumber } from 'ethers'
import { PolicyState, TransactionCondition, Unit } from '../constants/enums'
import { Contract } from '@ethersproject/contracts'

export type NetworkCache = {
  name: string
  chainId: number
  tokens: any
  positions: any
}

export type ClaimDetails = { id: string; cooldown: string; canWithdraw: boolean; amount: BigNumber }

export type Policy = {
  policyId: number
  policyHolder: string
  productAddress: string
  productName: string
  positionContract: string
  expirationBlock: number
  coverAmount: string
  price: string
  status: PolicyState
  positionName: string
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

export type ClaimAssessment = {
  lossEventDetected: boolean
  amountOut: string
  deadline: string
  msgHash: string
  signature: string
  tokenIn?: string
  amountIn?: string
  tokenOut?: string
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

export type StringToStringMapping = { [key: string]: string }

export type SupportedProduct = { name: string; contract: Contract; signer: boolean }

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
  }
  config: {
    keyContracts: KeyContracts
    productContracts: any
    functions: {
      getTokens: any
      getBalances: any
    }
    productsRev: any
  }
  cache: {
    supportedProducts: any
  }
  metamaskChain?: MetamaskAddEthereumChain
  walletConfig: any
}

export type KeyContracts = {
  [key: string]: ContractSources
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
