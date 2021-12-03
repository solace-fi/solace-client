import { BigNumber } from 'ethers'
import {
  PolicyState,
  ProductName,
  TransactionCondition,
  Unit,
  SystemNotice,
  Error,
  PositionType,
} from '../constants/enums'
import { Contract } from '@ethersproject/contracts'

/*

networkCache = {
  chainId: number
  positions: {
    [key: string]: {   // supported product name
      positions: Position[]
    }
  }
  positionNames: {
    [key: string]: {   // supported product name
      positionNames: { 
        [key: string]: string[] // [token.token.address]: underlying symbols[]
      }
    }
  }
}

*/

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

export type ClaimDetails = { id: string; cooldown: string; canWithdraw: boolean; amount: BigNumber }

export type BasicData = {
  address: string
  name: string
}

export type Option = {
  id: BigNumber
  rewardAmount: BigNumber
  strikePrice: BigNumber
  expiry: BigNumber
}

export type Policy = {
  policyId: number
  policyHolder: string
  productAddress: string
  productName: string
  positionDescription: string
  positionAddrs: string[]
  positionNames: string[]
  underlyingPositionNames: string[]
  expirationBlock: number
  coverAmount: string
  price: string
  status: PolicyState
  claimAssessment?: ClaimAssessment
}

export type ReadToken = {
  address: string
  name: string
  symbol: string
  decimals: number
}

export type TokenInfo = ReadToken & {
  balance: BigNumber
}

export type NftTokenInfo = {
  id: BigNumber
  value: BigNumber
}

export type Position = {
  type: PositionType
  position: Token | LiquityPosition
}

export type TokenData = {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: BigNumber
}

export type Token = {
  token: TokenData
  underlying: TokenData[]
  eth: {
    balance: BigNumber
  }
  tokenType: 'token' | 'nft' // different types of token positions call for different ui appearances
  metadata?: any
}

export type LiquityPosition = {
  positionName: string
  positionAddress: string
  amount: BigNumber
  nativeAmount: BigNumber
  associatedToken: {
    address: string
    name: string
    symbol: string
  }
}

export type BondToken = {
  id: BigNumber
  payoutToken: string
  payoutAmount: BigNumber
  pricePaid: BigNumber
  maturation: BigNumber
}

export type BondTellerDetails = {
  tellerData: BondTellerData
  principalData?: BondPrincipalData
}

export type BondTellerData = {
  teller: BondTellerContract
  principalAddr: string
  bondPrice: BigNumber
  usdBondPrice: number
  vestingTermInSeconds: number
  capacity: BigNumber
  maxPayout: BigNumber
  bondFeeBps: BigNumber
}

export type BondPrincipalData = {
  principal: Contract
  principalProps: {
    symbol: string
    decimals: number
    name: string
  }
  token0?: string
  token1?: string
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
  fast: number
  proposed: number
  safe: number
  suggestBaseFee?: number
}

export type GasConfiguration =
  | {
      maxFeePerGas?: undefined
      type?: undefined
      gasPrice?: undefined
    }
  | {
      maxFeePerGas: number
      type: number
      gasPrice?: undefined
    }
  | {
      gasPrice: number
      maxFeePerGas?: undefined
      type?: undefined
    }

export type StringToStringMapping = { [key: string]: string }

export type SupportedProduct = {
  name: ProductName
  positionsType: PositionType
  productLink?: string
  gasLimits?: {
    // network chain Id
    [key: number]: {
      // mapping of FunctionName to gas limit number
      [key: string]: number
    }
  }
  supportedSubProducts?: {
    [key: number]: string[] // array of farm or other pool positions for a product supported on different chains
  }

  getTokens?: {
    [key: number]: (provider: any, activeNetwork: NetworkConfig, metadata?: any) => Promise<Token[]>
  }
  getBalances?: {
    [key: number]: (user: string, provider: any, activeNetwork: NetworkConfig, tokens: Token[]) => Promise<Token[]>
  }
  getPositions?: {
    [key: number]: any
  }
}

export type ProductContract = {
  name: string
  contract: Contract
}

export type BondTellerContract = {
  name: string
  contract: Contract
  isBondTellerErc20: boolean
  isLp: boolean
  underlyingAddr: string
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
}

export type TxResult = {
  tx: any | null
  localTx: LocalTx | null
}

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
