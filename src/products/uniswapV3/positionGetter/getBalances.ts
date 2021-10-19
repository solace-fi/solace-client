import { NetworkConfig, Token as _Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances, getProductTokenBalances } from '../../getBalances'
import { accurateMultiply, getNonHumanValue } from '../../../utils/formatting'
import { withBackoffRetries } from '../../../utils/time'
import { BigNumber } from 'ethers'
import { TickMath, Position, Pool, Route } from '@uniswap/v3-sdk'
import { Token, Price, CurrencyAmount } from '@uniswap/sdk-core'

import { ZERO } from '../../../constants'
import axios from 'axios'
import JSBI from 'jsbi'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const USDCToken = new Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6) // mainnet usdc

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  cache: new InMemoryCache(),
})

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: _Token[]
): Promise<_Token[]> => {
  const chainStablecoin = stablecoinForChain[activeNetwork.chainId]

  for (let i = 0; i < tokens.length; i++) {
    const _tokenA = tokens[i].underlying[0]
    const _tokenB = tokens[i].underlying[1]
    const tokenA = new Token(activeNetwork.chainId, _tokenA.address, _tokenA.decimals, _tokenA.symbol, _tokenA.name)
    const tokenB = new Token(activeNetwork.chainId, _tokenB.address, _tokenB.decimals, _tokenB.symbol, _tokenB.name)

    const fee_Of_TokenA_And_TokenB = parseInt(tokens[i].metadata.fee)
    const poolTick_Of_TokenA_And_TokenB = parseInt(tokens[i].metadata.poolTick)
    const sqrtRatioX96_Of_TokenA_And_TokenB = TickMath.getSqrtRatioAtTick(poolTick_Of_TokenA_And_TokenB)
    const L_Of_TokenA_And_TokenB = JSBI.BigInt(tokens[i].metadata.positionLiquidity)
    const poolL_Of_TokenA_And_TokenB = JSBI.BigInt(tokens[i].metadata.poolLiquidity)

    const amountOut = computeStableCoinAmountOut[activeNetwork.chainId]
    const stablecoin = amountOut.currency

    let pool_TokenA_Stablecoin = undefined // if tokenA is same stablecoin, leave undefined
    let pool_TokenB_Stablecoin = undefined // if tokenB is same stablecoin, leave undefined

    let pools_Of_Stablecoin_And_TokenA = [] // discovered pools where token0 is stablecoin and token1 is tokenA
    let pools_Of_Stablecoin_And_TokenB = [] // discovered pools where token

    let price_Of_TokenA_Stablecoin = undefined
    let price_Of_TokenB_Stablecoin = undefined

    // search for pools where token0 is the stablecoin and token1 is tokenB
    // if tokenB is a mapped stablecoin, do not query for pools where token0 is also the mapped stablecoin, they shouldn't exist
    if (tokenB.wrapped.equals(stablecoin)) {
      price_Of_TokenB_Stablecoin = new Price(stablecoin, stablecoin, '1', '1')
    } else {
      const poolsWhereToken0IsStablecoin = await client
        .query({
          query: gql`
            query pools($tokenStablecoin: String!) {
              pools(first: 1000, where: { token0: $tokenStablecoin }, orderBy: volumeUSD, orderDirection: desc) {
                token0 {
                  id
                  decimals
                  name
                }
                token1 {
                  id
                  decimals
                  name
                }
                liquidity
                tick
                sqrtPrice
                feeTier
              }
            }
          `,
          variables: {
            tokenStablecoin: chainStablecoin.address.toLowerCase(),
          },
        })
        .then((result) => result.data.pools)
      pools_Of_Stablecoin_And_TokenB = poolsWhereToken0IsStablecoin.filter(
        (p: any) => p.token1.id.toLowerCase() == tokenB.address.toLowerCase()
      )

      // if a pool of the stablecoin and the tokenB is not found where token0 is the stablecoin, search for pool where token0 is tokenB and token1 is the stablecoin
      if (pools_Of_Stablecoin_And_TokenB.length == 0) {
        const poolsWhereToken1IsStablecoin = await client
          .query({
            query: gql`
              query pools($tokenStablecoin: String!) {
                pools(first: 1000, where: { token1: $tokenStablecoin }, orderBy: volumeUSD, orderDirection: desc) {
                  token0 {
                    id
                    decimals
                    name
                  }
                  token1 {
                    id
                    decimals
                    name
                  }
                  liquidity
                  tick
                  sqrtPrice
                  feeTier
                }
              }
            `,
            variables: {
              tokenStablecoin: chainStablecoin.address.toLowerCase(),
            },
          })
          .then((result) => result.data.pools)
        pools_Of_Stablecoin_And_TokenB = poolsWhereToken1IsStablecoin.filter(
          (p: any) => p.token0.id.toLowerCase() == tokenB.address.toLowerCase()
        )
      }

      // plug resulting pool in here after queries
      pool_TokenB_Stablecoin = pools_Of_Stablecoin_And_TokenB[0]

      // create pool
      const pool_Of_TokenB_Stablecoin = new Pool(
        tokenB,
        chainStablecoin,
        parseInt(pool_TokenB_Stablecoin.feeTier),
        TickMath.getSqrtRatioAtTick(parseInt(pool_TokenB_Stablecoin.tick)),
        JSBI.BigInt(pool_TokenB_Stablecoin.liquidity),
        parseInt(pool_TokenB_Stablecoin.tick)
      )

      // create route from pool
      const route_Of_TokenB_Stablecoin = new Route([pool_Of_TokenB_Stablecoin], tokenB, chainStablecoin)
      const midPriceTokenB_Stablecoin = route_Of_TokenB_Stablecoin.midPrice

      // create price from route
      price_Of_TokenB_Stablecoin = new Price(
        tokenB,
        chainStablecoin,
        midPriceTokenB_Stablecoin.denominator,
        midPriceTokenB_Stablecoin.numerator
      )
    }

    // search for pools where token0 is the stablecoin and token1 is tokenA
    // if tokenA is a mapped stablecoin, do not query for pools where token0 is also the mapped stablecoin, they shouldn't exist
    if (tokenA.wrapped.equals(stablecoin)) {
      price_Of_TokenA_Stablecoin = new Price(stablecoin, stablecoin, '1', '1')
    } else {
      const poolsWhereToken0IsStablecoin = await client
        .query({
          query: gql`
            query pools($tokenStablecoin: String!) {
              pools(first: 1000, where: { token0: $tokenStablecoin }, orderBy: volumeUSD, orderDirection: desc) {
                token0 {
                  id
                  decimals
                  name
                }
                token1 {
                  id
                  decimals
                  name
                }
                liquidity
                tick
                sqrtPrice
                feeTier
              }
            }
          `,
          variables: {
            tokenStablecoin: chainStablecoin.address.toLowerCase(),
          },
        })
        .then((result) => result.data.pools)
      pools_Of_Stablecoin_And_TokenA = poolsWhereToken0IsStablecoin.filter(
        (p: any) => p.token1.id.toLowerCase() == tokenA.address.toLowerCase()
      )

      // if a pool of the stablecoin and the tokenA is not found where token0 is the stablecoin, search for pool where token0 is tokenA and token1 is the stablecoin
      if (pools_Of_Stablecoin_And_TokenA.length == 0) {
        const poolsWhereToken1IsStablecoin = await client
          .query({
            query: gql`
              query pools($tokenStablecoin: String!) {
                pools(first: 1000, where: { token1: $tokenStablecoin }, orderBy: volumeUSD, orderDirection: desc) {
                  token0 {
                    id
                    decimals
                    name
                  }
                  token1 {
                    id
                    decimals
                    name
                  }
                  liquidity
                  tick
                  sqrtPrice
                  feeTier
                }
              }
            `,
            variables: {
              tokenStablecoin: chainStablecoin.address.toLowerCase(),
            },
          })
          .then((result) => result.data.pools)
        pools_Of_Stablecoin_And_TokenA = poolsWhereToken1IsStablecoin.filter(
          (p: any) => p.token0.id.toLowerCase() == tokenA.address.toLowerCase()
        )
      }

      // plug resulting pool in here after queries
      pool_TokenA_Stablecoin = pools_Of_Stablecoin_And_TokenA[0]

      // create pool
      const pool_Of_TokenA_Stablecoin = new Pool(
        tokenA,
        chainStablecoin,
        parseInt(pool_TokenA_Stablecoin.feeTier),
        TickMath.getSqrtRatioAtTick(parseInt(pool_TokenA_Stablecoin.tick)),
        JSBI.BigInt(pool_TokenA_Stablecoin.liquidity),
        parseInt(pool_TokenA_Stablecoin.tick)
      )

      // create route from pool
      const route_Of_TokenA_Stablecoin = new Route([pool_Of_TokenA_Stablecoin], tokenA, chainStablecoin)
      const midPriceTokenA_Stablecoin = route_Of_TokenA_Stablecoin.midPrice

      // create price from route
      price_Of_TokenA_Stablecoin = new Price(
        tokenA,
        chainStablecoin,
        midPriceTokenA_Stablecoin.denominator,
        midPriceTokenA_Stablecoin.numerator
      )
    }

    const pool_Of_TokenA_And_TokenB = new Pool(
      tokenA,
      tokenB,
      fee_Of_TokenA_And_TokenB,
      sqrtRatioX96_Of_TokenA_And_TokenB,
      poolL_Of_TokenA_And_TokenB,
      poolTick_Of_TokenA_And_TokenB
    )

    const position = new Position({
      pool: pool_Of_TokenA_And_TokenB,
      liquidity: L_Of_TokenA_And_TokenB,
      tickLower: parseInt(tokens[i].metadata.tickLower),
      tickUpper: parseInt(tokens[i].metadata.tickUpper),
    })

    const amount0InStablecoin = price_Of_TokenA_Stablecoin.quote(position.amount0)
    const amount1InStablecoin = price_Of_TokenB_Stablecoin.quote(position.amount1)

    const totalAmountInStablecoin = amount0InStablecoin.add(amount1InStablecoin)
    const humanUCSDAmount = totalAmountInStablecoin.toFixed(chainStablecoin.decimals, { groupSeparator: ',' })

    const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${
      chainStablecoin.address
    }&toTokenAddress=${ETH}&amount=${accurateMultiply(humanUCSDAmount, chainStablecoin.decimals)}`
    const res = await withBackoffRetries(async () => axios.get(url))
    tokens[i].eth.balance = BigNumber.from(res.data.toTokenAmount)
  }
  return tokens
}

export const stablecoinForChain: { [chainId: number]: Token } = {
  [1]: USDCToken,
}

export const computeStableCoinAmountOut: { [chainId: number]: CurrencyAmount<Token> } = {
  [1]: CurrencyAmount.fromRawAmount(USDCToken, 100_000e6),
}
