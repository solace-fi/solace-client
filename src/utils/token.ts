import { BigNumber as BN } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { rangeFrom0 } from './numeric'

export const sortTokens = (tokenA: string, tokenB: string): [string, string] => {
  return BN.from(tokenA).lt(BN.from(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA]
}

export const listTokensOfOwner = async (token: Contract, account: string): Promise<BN[]> => {
  const numTokensOfOwner: BN = await token.balanceOf(account)
  const indices = rangeFrom0(numTokensOfOwner.toNumber())
  const tokenIds: BN[] = await Promise.all(
    indices.map(async (index: number) => await token.tokenOfOwnerByIndex(account, index))
  )
  return tokenIds
}
