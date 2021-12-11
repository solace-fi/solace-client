import { PositionType } from '../enums'
import { BigNumber } from 'ethers'

export type Position = {
  type: PositionType
  position: Token | LiquityPosition
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

export type Token = {
  token: TokenData
  underlying: TokenData[]
  eth: {
    balance: BigNumber
  }
  tokenType: 'token' | 'nft' // different types of token positions call for different ui appearances
  metadata?: any
}

export type TokenData = {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: BigNumber
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
