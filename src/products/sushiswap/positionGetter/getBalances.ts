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
import { getAmounts_MasterChefStakingPool } from './getStakes/MasterChefStakingFarm'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { queryBalance } from '../../../utils/contract'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  if (tokens.length == 0) return []

  const balances: Token[] = tokens
  const indices = rangeFrom0(balances.length)

  /*

    farm contract segment

  */

  const additionalTokenBalances: BigNumber[] = []
  indices.forEach((i) => (additionalTokenBalances[i] = ZERO))

  const farmAmounts: BigNumber[][] = await Promise.all([
    getAmounts_MasterChefStakingPool(user, provider, activeNetwork, balances),
  ])

  for (let i = 0; i < balances.length; i++) {
    let newBalance = ZERO
    for (let j = 0; j < farmAmounts[i].length; j++) {
      const a = farmAmounts[i][j]
      newBalance = a.add(newBalance)
    }
    additionalTokenBalances[i] = newBalance
  }

  /*

    get balances for lp tokens in user wallet (and fetched farm positions)

  */

  const lpTokenContracts = balances.map((token) => getContract(token.token.address, ierc20Json.abi, provider))
  const queriedBalances = await Promise.all(lpTokenContracts.map((contract) => queryBalance(contract, user)))
  indices.forEach((i) => (balances[i].token.balance = queriedBalances[i].add(additionalTokenBalances[i])))

  for (let i = 0; i < balances.length; i++) {
    if (balances[i].token.balance.gt(ZERO)) {
      const token0Contract = getContract(balances[i].underlying[0].address, ierc20Json.abi, provider)
      const token1Contract = getContract(balances[i].underlying[1].address, ierc20Json.abi, provider)

      const bal0 = await withBackoffRetries(async () => queryBalance(token0Contract, balances[i].token.address))
      const bal1 = await withBackoffRetries(async () => queryBalance(token1Contract, balances[i].token.address))

      const totalSupply = await lpTokenContracts[i].totalSupply()
      const liquidity = await withBackoffRetries(async () =>
        queryBalance(lpTokenContracts[i], balances[i].token.address)
      )

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
