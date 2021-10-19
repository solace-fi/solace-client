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

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const USDCToken = new Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6) // mainnet usdc

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: _Token[]
): Promise<_Token[]> => {
  for (let i = 0; i < tokens.length; i++) {
    const _token0 = tokens[i].underlying[0]
    const _token1 = tokens[i].underlying[1]
    const token0 = new Token(activeNetwork.chainId, _token0.address, _token0.decimals, _token0.symbol, _token0.name)
    const token1 = new Token(activeNetwork.chainId, _token1.address, _token1.decimals, _token1.symbol, _token1.name)
    const chainStablecoin = stablecoinForChain[activeNetwork.chainId]

    const feeOfToken0andToken1 = parseInt(tokens[i].metadata.fee)
    const poolTickOfToken0andToken1 = parseInt(tokens[i].metadata.poolTick)
    const sqrtRatioX96OfToken0andToken1 = TickMath.getSqrtRatioAtTick(poolTickOfToken0andToken1)
    const LOfToken0andToken1 = JSBI.BigInt(tokens[i].metadata.positionLiquidity)
    const poolLOfToken0andToken1 = JSBI.BigInt(tokens[i].metadata.poolLiquidity)
    const poolOfToken0AndToken1 = new Pool(
      token0,
      token1,
      feeOfToken0andToken1,
      sqrtRatioX96OfToken0andToken1,
      poolLOfToken0andToken1,
      poolTickOfToken0andToken1
    )

    const position = new Position({
      pool: poolOfToken0AndToken1,
      liquidity: LOfToken0andToken1,
      tickLower: parseInt(tokens[i].metadata.tickLower),
      tickUpper: parseInt(tokens[i].metadata.tickUpper),
    })

    const client = new ApolloClient({
      uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      cache: new InMemoryCache(),
    })

    let poolToken0_Stablecoin = undefined
    let poolToken1_Stablecoin = undefined

    const poolsWhereToken0IsStablecoin = await client
      .query({
        query: gql`
          query pools($tokenStablecoin: String!) {
            pools(first: 1000, where: { token0: $tokenStablecoin }) {
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

    const poolOfStablecoinAndToken0 = poolsWhereToken0IsStablecoin.filter(
      (p: any) => p.token1.id.toLowerCase() == _token0.address.toLowerCase(),
      _token0.address
    )
    const poolOfStablecoinAndToken1 = poolsWhereToken0IsStablecoin.filter(
      (p: any) => p.token1.id.toLowerCase() == _token1.address.toLowerCase()
    )

    if (poolOfStablecoinAndToken0.length > 0) {
      poolToken0_Stablecoin = poolOfStablecoinAndToken0[0]
    }
    if (poolOfStablecoinAndToken1.length > 0) {
      poolToken1_Stablecoin = poolOfStablecoinAndToken1[0]
    }

    if (poolOfStablecoinAndToken0.length == 0 || poolOfStablecoinAndToken1.length == 0) {
      const poolsWhereToken1IsStablecoin = await client
        .query({
          query: gql`
            query pools($tokenStablecoin: String!) {
              pools(first: 1000, where: { token1: $tokenStablecoin }) {
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

      if (poolOfStablecoinAndToken0.length == 0) {
        const poolsOfToken0AndStablecoin = poolsWhereToken1IsStablecoin.filter(
          (p: any) => p.token0.id.toLowerCase() == _token0.address.toLowerCase()
        )
        poolToken0_Stablecoin = poolsOfToken0AndStablecoin[0]
      }
      if (poolOfStablecoinAndToken1.length == 0) {
        const poolsOfToken1AndStablecoin = poolsWhereToken1IsStablecoin.filter(
          (p: any) => p.token0.id.toLowerCase() == _token1.address.toLowerCase()
        )
        poolToken1_Stablecoin = poolsOfToken1AndStablecoin[0]
      }
    }

    const poolOfToken0_Stablecoin = new Pool(
      token0,
      chainStablecoin,
      parseInt(poolToken0_Stablecoin.feeTier),
      TickMath.getSqrtRatioAtTick(parseInt(poolToken0_Stablecoin.tick)),
      JSBI.BigInt(poolToken0_Stablecoin.liquidity),
      parseInt(poolToken0_Stablecoin.tick)
    )

    const poolOfToken1_Stablecoin = new Pool(
      chainStablecoin,
      token1,
      parseInt(poolToken1_Stablecoin.feeTier),
      TickMath.getSqrtRatioAtTick(parseInt(poolToken1_Stablecoin.tick)),
      JSBI.BigInt(poolToken1_Stablecoin.liquidity),
      parseInt(poolToken1_Stablecoin.tick)
    )

    const routeOfToken0_Stablecoin = new Route([poolOfToken0_Stablecoin], token0, chainStablecoin)
    const routeOfToken1_Stablecoin = new Route([poolOfToken1_Stablecoin], token1, chainStablecoin)

    const midPriceToken0_Stablecoin = routeOfToken0_Stablecoin.midPrice
    const midPriceToken1_Stablecoin = routeOfToken1_Stablecoin.midPrice

    let priceOfToken0_Stablecoin = null
    let priceOfToken1_Stablecoin = null

    const amountOut = computeStableCoinAmountOut[activeNetwork.chainId]
    const stablecoin = amountOut.currency

    if (token0.wrapped.equals(stablecoin)) {
      priceOfToken0_Stablecoin = new Price(stablecoin, stablecoin, '1', '1')
    } else {
      priceOfToken0_Stablecoin = new Price(
        token0,
        chainStablecoin,
        midPriceToken0_Stablecoin.denominator,
        midPriceToken0_Stablecoin.numerator
      )
    }

    if (token1.wrapped.equals(stablecoin)) {
      priceOfToken1_Stablecoin = new Price(stablecoin, stablecoin, '1', '1')
    } else {
      priceOfToken1_Stablecoin = new Price(
        token1,
        chainStablecoin,
        midPriceToken1_Stablecoin.denominator,
        midPriceToken1_Stablecoin.numerator
      )
    }

    const amount0InStablecoin = priceOfToken0_Stablecoin.quote(position.amount0)
    const amount1InStablecoin = priceOfToken1_Stablecoin.quote(position.amount1)

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
