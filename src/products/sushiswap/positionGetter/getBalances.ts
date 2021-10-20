import { NetworkConfig, Token } from '../../../constants/types'
import { getProductTokenBalances, queryNativeTokenBalance } from '../../getBalances'
import { getContract } from '../../../utils'
import { THEGRAPH_API_KEY, ZERO } from '../../../constants'
import { rangeFrom0, bnCmp } from '../../../utils/numeric'

import masterchefABI from './_contracts/IMasterChef.json'
import masterchefStakingPoolABI from './_contracts/IMasterChefStakingPool.json'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import axios from 'axios'
import ierc20Json from '../../_contracts/IERC20Metadata.json'
import { getBalances_MasterChefStakingPool } from './getFarmBalances/MasterChefStakingFarm'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  let balances: Token[] = tokens

  /*

    farm contract segment

  */

  balances = await getBalances_MasterChefStakingPool(user, provider, activeNetwork, balances)

  /*

    get balances for lp tokens in user wallet (and fetched farm positions)

  */

  const lpTokenContracts = balances.map((token) => getContract(token.token.address, ierc20Json.abi, provider))
  const queriedBalances = await Promise.all(lpTokenContracts.map((contract) => contract.balanceOf(user)))
  const indices = rangeFrom0(balances.length)
  indices.forEach((i) => (balances[i].token.balance = balances[i].token.balance.add(queriedBalances[i])))

  for (let i = 0; i < balances.length; i++) {
    if (balances[i].token.balance.gt(ZERO)) {
      const token0Contract = getContract(balances[i].underlying[0].address, ierc20Json.abi, provider)
      const token1Contract = getContract(balances[i].underlying[1].address, ierc20Json.abi, provider)

      const bal0 = await withBackoffRetries(async () => token0Contract.balanceOf(balances[i].token.address))
      const bal1 = await withBackoffRetries(async () => token1Contract.balanceOf(balances[i].token.address))

      const totalSupply = await lpTokenContracts[i].totalSupply()
      const liquidity = await withBackoffRetries(async () => lpTokenContracts[i].balanceOf(balances[i].token.address))

      const adjustedLiquidity = liquidity.add(balances[i].token.balance)

      const amount0 = adjustedLiquidity.mul(bal0).div(totalSupply)
      const amount1 = adjustedLiquidity.mul(bal1).div(totalSupply)

      balances[i].underlying[0].balance = amount0
      balances[i].underlying[1].balance = amount1

      let standingEthAmount = ZERO
      for (let j = 0; j < balances[i].underlying.length; j++) {
        const fetchedAmount = await queryNativeTokenBalance(balances[i].underlying[j], activeNetwork.chainId)
        standingEthAmount = standingEthAmount.add(fetchedAmount)
      }
      balances[i].eth.balance = standingEthAmount
    }
  }
  const newBalances = balances
  return newBalances.filter((b) => b.token.balance.gt(ZERO))
}
