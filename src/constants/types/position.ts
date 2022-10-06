import { BigNumber } from 'ethers'

export type ReadTokenData = {
  constants: { name: string; symbol: string; decimals: number }
  address: { [chainId: number]: string }
}

export type ReadToken = {
  address: string
  name: string
  symbol: string
  decimals: number
}

export type TokenInfo = ReadToken & {
  balance: BigNumber
  price: number
}

export type PoolTokenInfo = TokenInfo & {
  poolBalance: BigNumber
}
