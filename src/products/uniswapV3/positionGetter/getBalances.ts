import { NetworkConfig, Token as _Token } from '../../../constants/types'
import { accurateMultiply, capitalizeFirstLetter, getExponentValue } from '../../../utils/formatting'
import { BigNumber } from 'ethers'
import { TickMath, Position, Pool, Route } from '@uniswap/v3-sdk'
import { Token, Price } from '@uniswap/sdk-core'
import UniV3FactoryAbi from './_contracts/IUniswapV3Factory.json'

import { ADDRESS_ZERO, ZERO } from '../../../constants'
import JSBI from 'jsbi'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { getContract } from '../../../utils'
import { get1InchPrice, getCoingeckoTokenPrice, getZapperProtocolBalances } from '../../../utils/api'
import { WETH9_ADDRESS } from '../../../constants/mappings/tokenAddressMapping'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { createZapperBalanceMap, networkNames } from '../../zapperBalances'

/*

  TODO: uniV3 position balance getter JSBI issues

  This getter is currently broken probably due to mismatch between versions of involved packages, including v3-sdk and JSBI.

  Two errors keep popping up:

    "Convert JSBI instances to native numbers using toNumber."

    "Argument of type 'JSBI' is not assignable to parameter of type 'BigintIsh'"

*/
const UniV3FactoryAddr = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const WETHToken = new Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18, 'WETH', 'Wrapped Ether') // mainnet eth

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
  // const nativeToken = tokenForChain[activeNetwork.chainId]
  const zapperNet = networkNames[activeNetwork.chainId]
  if (!zapperNet) return []

  const coinGeckoEthPrice = await getCoingeckoTokenPrice(WETH9_ADDRESS[activeNetwork.chainId], 'usd', 'ethereum')
  const data = await getZapperProtocolBalances('uniswap-v3', [user], zapperNet)

  const finalTokens: _Token[] = []

  if (!coinGeckoEthPrice) return tokens
  const tokenMap = createZapperBalanceMap(
    data,
    user,
    parseFloat(coinGeckoEthPrice),
    activeNetwork.nativeCurrency.decimals,
    tokens
  )
  tokenMap.forEach((value: _Token) => {
    finalTokens.push(value)
  })
  return finalTokens

  // const uniV3FactoryContract = getContract(UniV3FactoryAddr, UniV3FactoryAbi, provider)

  // for (let i = 0; i < tokens.length; i++) {
  //   const _tokenA = tokens[i].underlying[0]
  //   const _tokenB = tokens[i].underlying[1]
  //   const tokenA = new Token(activeNetwork.chainId, _tokenA.address, _tokenA.decimals, _tokenA.symbol, _tokenA.name)
  //   const tokenB = new Token(activeNetwork.chainId, _tokenB.address, _tokenB.decimals, _tokenB.symbol, _tokenB.name)

  //   const fee_Of_TokenA_And_TokenB = parseInt(tokens[i].metadata.fee)
  //   const poolTick_Of_TokenA_And_TokenB = parseInt(tokens[i].metadata.poolTick)
  //   const sqrtRatioX96_Of_TokenA_And_TokenB = TickMath.getSqrtRatioAtTick(poolTick_Of_TokenA_And_TokenB)
  //   const L_Of_TokenA_And_TokenB = JSBI.BigInt(tokens[i].metadata.positionLiquidity)
  //   const poolL_Of_TokenA_And_TokenB = JSBI.BigInt(tokens[i].metadata.poolLiquidity)

  //   let price_Of_TokenA_NativeToken = undefined
  //   let price_Of_TokenB_NativeToken = undefined

  //   if (tokenA.address != nativeToken.address) {
  //     const [
  //       poolAddr_tokenA_And_Native_500,
  //       poolAddr_tokenA_And_Native_3000,
  //       poolAddr_tokenA_And_Native_10000,
  //     ] = await Promise.all([
  //       uniV3FactoryContract.getPool(tokenA.address.toLowerCase(), nativeToken.address, 500),
  //       uniV3FactoryContract.getPool(tokenA.address.toLowerCase(), nativeToken.address, 3000),
  //       uniV3FactoryContract.getPool(tokenA.address.toLowerCase(), nativeToken.address, 10000),
  //     ])

  //     const legitPoolAddr_tokenA_And_Native =
  //       poolAddr_tokenA_And_Native_500 != ADDRESS_ZERO
  //         ? poolAddr_tokenA_And_Native_500
  //         : poolAddr_tokenA_And_Native_3000 != ADDRESS_ZERO
  //         ? poolAddr_tokenA_And_Native_3000
  //         : poolAddr_tokenA_And_Native_10000

  //     const pool = await client
  //       .query({
  //         query: gql`
  //           query pools($poolAddr: String!) {
  //             pools(where: { id: $poolAddr }) {
  //               token0 {
  //                 id
  //                 decimals
  //                 name
  //               }
  //               token1 {
  //                 id
  //                 decimals
  //                 name
  //               }
  //               liquidity
  //               tick
  //               sqrtPrice
  //               feeTier
  //             }
  //           }
  //         `,
  //         variables: {
  //           poolAddr: legitPoolAddr_tokenA_And_Native.toLowerCase(),
  //         },
  //       })
  //       .then((result) => result.data.pools[0])

  //     const pool_Of_TokenA_NativeToken = new Pool(
  //       tokenA,
  //       nativeToken,
  //       parseInt(pool.feeTier),
  //       TickMath.getSqrtRatioAtTick(parseInt(pool.tick)).toString(),
  //       pool.liquidity,
  //       parseInt(pool.tick)
  //     )

  //     const route_Of_TokenA_NativeToken = new Route([pool_Of_TokenA_NativeToken], tokenA, nativeToken)
  //     const midPriceTokenA_NativeToken = route_Of_TokenA_NativeToken.midPrice
  //     price_Of_TokenA_NativeToken = new Price(
  //       tokenA,
  //       nativeToken,
  //       midPriceTokenA_NativeToken.denominator,
  //       midPriceTokenA_NativeToken.numerator
  //     )
  //   } else {
  //     price_Of_TokenA_NativeToken = new Price(nativeToken, nativeToken, '1', '1')
  //   }

  //   if (tokenB.address != nativeToken.address) {
  //     const [
  //       poolAddr_tokenB_And_Native_500,
  //       poolAddr_tokenB_And_Native_3000,
  //       poolAddr_tokenB_And_Native_10000,
  //     ] = await Promise.all([
  //       uniV3FactoryContract.getPool(tokenB.address.toLowerCase(), nativeToken.address, 500),
  //       uniV3FactoryContract.getPool(tokenB.address.toLowerCase(), nativeToken.address, 3000),
  //       uniV3FactoryContract.getPool(tokenB.address.toLowerCase(), nativeToken.address, 10000),
  //     ])

  //     const legitPoolAddr_tokenB_And_Native =
  //       poolAddr_tokenB_And_Native_500 != ADDRESS_ZERO
  //         ? poolAddr_tokenB_And_Native_500
  //         : poolAddr_tokenB_And_Native_3000 != ADDRESS_ZERO
  //         ? poolAddr_tokenB_And_Native_3000
  //         : poolAddr_tokenB_And_Native_10000

  //     const pool = await client
  //       .query({
  //         query: gql`
  //           query pools($poolAddr: String!) {
  //             pools(where: { id: $poolAddr }) {
  //               token0 {
  //                 id
  //                 decimals
  //                 name
  //               }
  //               token1 {
  //                 id
  //                 decimals
  //                 name
  //               }
  //               liquidity
  //               tick
  //               sqrtPrice
  //               feeTier
  //             }
  //           }
  //         `,
  //         variables: {
  //           poolAddr: legitPoolAddr_tokenB_And_Native.toLowerCase(),
  //         },
  //       })
  //       .then((result) => result.data.pools[0])

  //     const pool_Of_TokenB_NativeToken = new Pool(
  //       tokenB,
  //       nativeToken,
  //       parseInt(pool.feeTier),
  //       TickMath.getSqrtRatioAtTick(parseInt(pool.tick)).toString(),
  //       pool.liquidity,
  //       parseInt(pool.tick)
  //     )
  //     const route_Of_TokenB_NativeToken = new Route([pool_Of_TokenB_NativeToken], tokenB, nativeToken)
  //     const midPriceTokenB_NativeToken = route_Of_TokenB_NativeToken.midPrice
  //     price_Of_TokenB_NativeToken = new Price(
  //       tokenB,
  //       nativeToken,
  //       midPriceTokenB_NativeToken.denominator,
  //       midPriceTokenB_NativeToken.numerator
  //     )
  //   } else {
  //     price_Of_TokenB_NativeToken = new Price(nativeToken, nativeToken, '1', '1')
  //   }

  //   const pool_Of_TokenA_And_TokenB = new Pool(
  //     tokenA,
  //     tokenB,
  //     fee_Of_TokenA_And_TokenB,
  //     sqrtRatioX96_Of_TokenA_And_TokenB.toString(),
  //     poolL_Of_TokenA_And_TokenB.toString(),
  //     poolTick_Of_TokenA_And_TokenB
  //   )

  //   const position = new Position({
  //     pool: pool_Of_TokenA_And_TokenB,
  //     liquidity: L_Of_TokenA_And_TokenB.toString(),
  //     tickLower: parseInt(tokens[i].metadata.tickLower),
  //     tickUpper: parseInt(tokens[i].metadata.tickUpper),
  //   })

  //   const amount0InNativeToken = price_Of_TokenA_NativeToken.quote(position.amount0)
  //   const amount1InNativeToken = price_Of_TokenB_NativeToken.quote(position.amount1)

  //   const totalAmountInNativeToken = amount0InNativeToken.add(amount1InNativeToken)
  //   const convertedNativeTokenAmount = totalAmountInNativeToken.toFixed(nativeToken.decimals)

  //   tokens[i].eth.balance = BigNumber.from(accurateMultiply(convertedNativeTokenAmount, nativeToken.decimals))
  // }
  // return tokens
}

export const tokenForChain: { [chainId: number]: Token } = {
  [1]: WETHToken,
}
