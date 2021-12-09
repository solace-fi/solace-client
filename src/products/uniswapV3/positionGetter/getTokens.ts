import { NetworkConfig, Token } from '../../../constants/types'
import { ZERO } from '../../../constants'
import { BigNumber } from 'ethers'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  const tokens: Token[] = []
  if (!provider) return []
  if (!metadata.user) return []

  /*

  APOLLO RETRIEVAL

  */

  const client = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    cache: new InMemoryCache(),
  })

  const apolloData = await client
    .query({
      query: gql`
        query pairs($user: String!) {
          positions(first: 1000, where: { owner_contains: $user }) {
            id
            owner
            tickLower {
              tickIdx
            }
            tickUpper {
              tickIdx
            }
            token0 {
              name
              id
              symbol
              decimals
            }
            token1 {
              name
              id
              symbol
              decimals
            }
            pool {
              id
              tick
              sqrtPrice
              feeTier
              liquidity
            }
            liquidity
          }
        }
      `,
      variables: {
        user: metadata.user.toLowerCase(),
      },
    })
    .then((result) => result.data.positions.filter((p: any) => BigNumber.from(p.liquidity).gt(ZERO)))
    .catch((e) => {
      console.log('apollo fetch at uniswapV3.getTokens failed', e)
      return []
    })

  for (let i = 0; i < apolloData.length; i++) {
    const token0Addr = apolloData[i].token0.id
    const token0Name = apolloData[i].token0.name
    const token0Symbol = apolloData[i].token0.symbol
    const token0Decimals = apolloData[i].token0.decimals

    const token1Addr = apolloData[i].token1.id
    const token1Name = apolloData[i].token1.name
    const token1Symbol = apolloData[i].token1.symbol
    const token1Decimals = apolloData[i].token1.decimals

    const poolAddress = apolloData[i].pool.id
    const lpTokenId = apolloData[i].id

    const token: Token = {
      token: {
        address: poolAddress.toLowerCase(),
        name: `#${lpTokenId} - ${token0Name}/${token1Name}`,
        symbol: `UNI-V3-POS`,
        decimals: 18,
        balance: ZERO,
      },
      underlying: [
        {
          address: token0Addr.toLowerCase(),
          name: token0Name,
          symbol: token0Symbol,
          decimals: parseInt(token0Decimals),
          balance: ZERO,
        },
        {
          address: token1Addr.toLowerCase(),
          name: token1Name,
          symbol: token1Symbol,
          decimals: parseInt(token1Decimals),
          balance: ZERO,
        },
      ],
      eth: {
        balance: ZERO,
      },
      tokenType: 'nft',
      metadata: {
        tokenId: lpTokenId,
        tickLower: apolloData[i].tickLower.tickIdx,
        tickUpper: apolloData[i].tickUpper.tickIdx,
        poolTick: apolloData[i].pool.tick,
        poolLiquidity: apolloData[i].pool.liquidity,
        positionLiquidity: apolloData[i].liquidity,
        sqrtPrice: apolloData[i].pool.sqrtPrice,
        fee: apolloData[i].pool.feeTier,
      },
    }

    tokens.push(token)
  }

  return tokens
}
