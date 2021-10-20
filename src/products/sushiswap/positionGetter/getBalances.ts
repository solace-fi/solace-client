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

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  const balances: Token[] = tokens

  /*

    farm contract segment

  */

  // const GRAPH_URL = `https://gateway.thegraph.com/api/${String(
  //   THEGRAPH_API_KEY
  // )}/subgraphs/id/0x4bb4c1b0745ef7b4642feeccd0740dec417ca0a0-1`

  // const client = new ApolloClient({
  //   uri: GRAPH_URL,
  //   cache: new InMemoryCache(),
  // })

  // const masterChefStakingContract = getContract(
  //   '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
  //   masterchefStakingPoolABI,
  //   provider
  // )

  // const apolloData = await client.query({
  //   query: gql`
  //     query pools($lpAddrs: [String]) {
  //       pools(where: { pair_in: $lpAddrs }) {
  //         id
  //         pair
  //       }
  //     }
  //   `,
  //   variables: {
  //     lpAddrs: tokens.map((t) => t.token.address.toLowerCase()),
  //   },
  // })

  // const pools = apolloData.data.pools

  // for (let i = 0; i < balances.length; i++) {
  //   const matchingPool = pools.find((pool: any) => pool.pair.toLowerCase() == balances[i].token.address.toLowerCase())

  //   if (matchingPool) {
  //     // check staking contract for balances
  //     const userInfo = await masterChefStakingContract.userInfo(
  //       BigNumber.from(matchingPool.id),
  //       balances[i].metadata.user
  //     )

  //     const amount = userInfo.amount
  //     balances[i].token.balance = balances[i].token.balance.add(amount)

  //     // if (amount.gt(ZERO)) {
  //     //   const farmToken: Token = {
  //     //     token: {
  //     //       address: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
  //     //       name: `MasterChef LP Staking Pool (${balances[i].underlying[0].symbol}/${balances[i].underlying[1].symbol})`,
  //     //       symbol: 'SLP',
  //     //       decimals: balances[i].token.decimals,
  //     //       balance: amount,
  //     //     },
  //     //     underlying: balances[i].underlying,
  //     //     eth: {
  //     //       balance: ZERO,
  //     //     },
  //     //     tokenType: 'token',
  //     //     metadata: {
  //     //       lpTokenAddress: balances[i].token.address,
  //     //     },
  //     //   }
  //     //   farmTokensToAdd.push(farmToken)
  //     // }
  //   }
  // }

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
