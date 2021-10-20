import { NetworkConfig, Token } from '../../../constants/types'
import { ETHERSCAN_API_KEY } from '../../../constants'
import ierc20Json from '../../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { ZERO } from '../../../constants'
import { numberify } from '../../../utils/numeric'
import { queryBalance, queryDecimals } from '../../../utils/contract'

import sushiLPTokenAbi from './_contracts/ISushiLPToken.json'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

// const SushiV2Factory_ADDR = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
// import sushiV2FactoryAbi from './_contracts/ISushiV2Factory.json'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  const tokens: Token[] = []

  if (!provider) return []
  if (!metadata.user || !metadata.transferHistory) return []

  const touchedAddresses = metadata.transferHistory
    .filter((r: any) => r.tokenName == 'SushiSwap LP Token')
    .map((r: any) => r.contractAddress)

  if (touchedAddresses.length == 0) return []

  const uniqueAddresses = touchedAddresses.filter(
    (item: string, index: number) => touchedAddresses.indexOf(item) == index
  )

  const client = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
    cache: new InMemoryCache(),
  })

  const apolloData = await client.query({
    query: gql`
      query pairs($addrs: [String]) {
        pairs(where: { id_in: $addrs }) {
          id
          name
          token0 {
            id
            name
            symbol
            decimals
          }
          token1 {
            id
            name
            symbol
            decimals
          }
        }
      }
    `,
    variables: {
      addrs: uniqueAddresses.map((addr: string) => addr.toLowerCase()),
    },
  })

  for (let i = 0; i < apolloData.data.pairs.length; i++) {
    const pair = apolloData.data.pairs[i]
    const lpTokenContract = getContract(pair.id, ierc20Json.abi, provider)
    const decimals = await queryDecimals(lpTokenContract)
    const token: Token = {
      token: {
        address: pair.id.toLowerCase(),
        name: pair.name,
        symbol: 'SLP',
        decimals: decimals,
        balance: ZERO,
      },
      underlying: [
        {
          address: pair.token0.id.toLowerCase(),
          name: pair.token0.name,
          symbol: pair.token0.symbol,
          decimals: parseInt(pair.token0.decimals),
          balance: ZERO,
        },
        {
          address: pair.token1.id.toLowerCase(),
          name: pair.token1.name,
          symbol: pair.token1.symbol,
          decimals: parseInt(pair.token1.decimals),
          balance: ZERO,
        },
      ],
      eth: {
        balance: ZERO,
      },
      tokenType: 'token',
      metadata: {
        user: metadata.user,
      },
    }
    tokens.push(token)
  }

  /*

  MANUAL RETRIEVAL

  */

  // for (let i = 0; i < uniqueSushiAddresses.length; i++) {
  //   const lpPairContract = getContract(uniqueSushiAddresses[i], sushiLPTokenAbi, provider)

  //   const balance = await queryBalance(lpPairContract, metadata.user)
  //   if (balance.gt(ZERO)) {
  //     const pairName: string = await queryName(lpPairContract)
  //     const pairSymbol: string = await querySymbol(lpPairContract)
  //     const pairDecimals: number = await queryDecimals(lpPairContract)

  //     const token0 = await lpPairContract.token0()
  //     const token1 = await lpPairContract.token1()

  //     const token0Contract = getContract(token0, ierc20Json.abi, provider)
  //     const token1Contract = getContract(token1, ierc20Json.abi, provider)

  //     const [name0, symbol0, decimals0, name1, symbol1, decimals1] = await Promise.all([
  //       await queryName(token0Contract),
  //       await querySymbol(token0Contract),
  //       await queryDecimals(token0Contract),
  //       await queryName(token1Contract),
  //       await querySymbol(token1Contract),
  //       await queryDecimals(token1Contract),
  //     ])

  //     const token = {
  //       token: {
  //         address: uniqueSushiAddresses[i],
  //         name: pairName,
  //         symbol: pairSymbol,
  //         decimals: pairDecimals,
  //         balance: balance,
  //       },
  //       underlying: [
  //         {
  //           address: token0,
  //           name: name0,
  //           symbol: symbol0,
  //           decimals: decimals0,
  //           balance: ZERO,
  //         },
  //         {
  //           address: token1,
  //           name: name1,
  //           symbol: symbol1,
  //           decimals: decimals1,
  //           balance: ZERO,
  //         },
  //       ],
  //       eth: {
  //         balance: ZERO,
  //       },
  //     }

  //     tokens.push(token)
  //   }
  // }

  return tokens
}
