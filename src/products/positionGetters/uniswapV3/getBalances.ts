import { NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances, getProductTokenBalances } from '../getBalances'
import { getNonHumanValue } from '../../../utils/formatting'
import { withBackoffRetries } from '../../../utils/time'
import { BigNumber } from 'ethers'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  for (let i = 0; i < tokens.length; i++) {
    const token0 = tokens[i].underlying[0]
    const token1 = tokens[i].underlying[1]

    const width: BigNumber = BigNumber.from(token1.balance.toNumber() - token0.balance.toNumber())
    const value = tokens[i].token.balance.mul(width)
  }
  return []
}
