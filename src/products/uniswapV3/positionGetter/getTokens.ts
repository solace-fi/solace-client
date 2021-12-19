import { NetworkConfig, Token } from '../../../constants/types'
// import ierc20Json from '../../../constants/metadata/IERC20Metadata.json'
// import { getContract } from '../../../utils'
import { /*ETHERSCAN_API_KEY,*/ ZERO } from '../../../constants'

// import factoryAbi from './_contracts/IUniswapV3Factory.json'
// import lpTokenAbi from './_contracts/IUniswapLpToken.json'
// import positionManagerAbi from '../../../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
// import { listTokensOfOwner } from '../../../utils/contract'
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
          positions(where: { owner_contains: $user }) {
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

  /*

  MANUAL RETRIEVAL

  */

  // const UNISWAPV3_FACTORY_ADDR = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
  // const UNISWAPV3_POSITION_MANAGER_ADDR = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

  // const factoryContract = getContract(UNISWAPV3_FACTORY_ADDR, factoryAbi, provider)
  // const positionManager = getContract(UNISWAPV3_POSITION_MANAGER_ADDR, positionManagerAbi.abi, provider)

  // const tokenIds = await listTokensOfOwner(positionManager, metadata.user)

  // const positions = await Promise.all(tokenIds.map((id) => positionManager.positions(id)))

  // const positionsWithLiquidity = positions.filter((p) => p.liquidity.gt(ZERO))

  // for (let i = 0; i < positionsWithLiquidity.length; i++) {
  //   const token0 = positionsWithLiquidity[i].token0
  //   const token1 = positionsWithLiquidity[i].token1
  //   const fee = positionsWithLiquidity[i].fee

  //   const tickLower: number = positionsWithLiquidity[i].tickLower
  //   const tickUpper: number = positionsWithLiquidity[i].tickUpper

  //   // console.log(token0, token1, fee, positionsWithLiquidity[i].liquidity, tickLower, tickUpper)

  //   const poolAddress = await factoryContract.getPool(token0, token1, fee)

  //   const token0Contract = getContract(token0, ierc20Json.abi, provider)
  //   const token1Contract = getContract(token1, ierc20Json.abi, provider)

  //   const [name0, symbol0, decimals0, name1, symbol1, decimals1] = await Promise.all([
  //     queryName(token0Contract, provider),
  //     querySymbol(token0Contract, provider),
  //     queryDecimals(token0Contract),
  //     queryName(token1Contract, provider),
  //     querySymbol(token1Contract, provider),
  //     queryDecimals(token1Contract),
  //   ])

  //   console.log(positionsWithLiquidity[i])

  //   const token: Token = {
  //     token: {
  //       address: poolAddress,
  //       name: `#${tokenIds[i]} - ${name0}/${name1}`,
  //       symbol: `UNI-V3-POS`,
  //       decimals: 18,
  //       balance: ZERO,
  //     },
  //     underlying: [
  //       {
  //         address: token0,
  //         name: name0,
  //         symbol: symbol0,
  //         decimals: decimals0,
  //         balance: ZERO,
  //       },
  //       {
  //         address: token1,
  //         name: name1,
  //         symbol: symbol1,
  //         decimals: decimals1,
  //         balance: ZERO,
  //       },
  //     ],
  //     eth: {
  //       balance: ZERO,
  //     },
  //     metadata: {
  //       tokenType: 'nft',
  //       tokenId: tokenIds[i],
  //       tickLower: tickLower,
  //       tickUpper: tickUpper,
  //       poolTick: positionsWithLiquidity[i].pool.tick,
  //       positionLiquidity: positionsWithLiquidity[i].liquidity,
  //       sqrtPrice: positionsWithLiquidity[i].pool.sqrtPrice,
  //     },
  //   }

  //   console.log(token)

  //   tokens.push(token)
  // }

  return tokens
}
