import { BigNumber as BN } from 'ethers'

export const sortTokens = (tokenA: string, tokenB: string) => {
  return BN.from(tokenA).lt(BN.from(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA]
}
