import { NetworkConfig, Token } from '../../../constants/types'
import { ETHERSCAN_API_KEY } from '../../../constants'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { ZERO } from '../../../constants'

import uniV2FactoryAbi from './_contracts/IUniV2Factory.json'
import uniLPTokenAbi from './_contracts/IUniLPToken.json'

// import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  // const uniV2FactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
  // const uniV2Contract = getContract(uniV2FactoryAddress, uniV2FactoryAbi, provider)

  const tokens: Token[] = []

  if (!metadata.user || !metadata.transferHistory) return []

  const touchedUniV2Addresses = metadata.transferHistory
    .filter((r: any) => r.tokenName == 'Uniswap V2')
    .map((r: any) => r.contractAddress)

  const uniqueUniV2Addresses = touchedUniV2Addresses.filter(
    (item: string, index: number) => touchedUniV2Addresses.indexOf(item) == index
  )

  // const client = new ApolloClient({
  //   uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
  //   cache: new InMemoryCache(),
  // })

  // let _lastID = ''
  // let length = 1000
  // let uniswapV2: any = []

  // while (length >= 1000) {
  //   await client
  //     .query({
  //       query: gql`
  //         query pairs($lastID: String) {
  //           pairs(first: 1000, where: { id_gt: $lastID }) {
  //             id
  //             token0 {
  //               id
  //               name
  //               symbol
  //               decimals
  //             }
  //             token1 {
  //               id
  //               name
  //               symbol
  //               decimals
  //             }
  //           }
  //         }
  //       `,
  //       variables: {
  //         lastID: _lastID,
  //       },
  //     })
  //     .then((result) => {
  //       length = result.data.pairs.length
  //       _lastID = result.data.pairs[result.data.pairs.length - 1].id
  //       uniswapV2 = [...uniswapV2, ...result.data.pairs]
  //     })
  // }

  // console.log('query completed:', uniswapV2, uniswapV2.length)

  for (let i = 0; i < uniqueUniV2Addresses.length; i++) {
    const lpPairContract = getContract(uniqueUniV2Addresses[i], uniLPTokenAbi, provider)

    const balance = await lpPairContract.balanceOf(metadata.user)
    if (balance.gt(ZERO)) {
      const pairName: string = await lpPairContract.name()
      const pairSymbol: string = await lpPairContract.symbol()
      const pairDecimals: number = await lpPairContract.decimals()

      const token0 = await lpPairContract.token0()
      const token1 = await lpPairContract.token1()

      const token0Contract = getContract(token0, ierc20Json.abi, provider)
      const token1Contract = getContract(token1, ierc20Json.abi, provider)

      const [name0, symbol0, decimals0, name1, symbol1, decimals1] = await Promise.all([
        await token0Contract.name(),
        await token0Contract.symbol(),
        await token0Contract.decimals(),
        await token1Contract.name(),
        await token1Contract.symbol(),
        await token1Contract.decimals(),
      ])

      const token = {
        token: {
          address: uniqueUniV2Addresses[i],
          name: pairName,
          symbol: pairSymbol,
          decimals: pairDecimals,
          balance: balance,
        },
        underlying: [
          {
            address: token0,
            name: name0,
            symbol: symbol0,
            decimals: decimals0,
            balance: ZERO,
          },
          {
            address: token1,
            name: name1,
            symbol: symbol1,
            decimals: decimals1,
            balance: ZERO,
          },
        ],
        eth: {
          balance: ZERO,
        },
      }

      tokens.push(token)
    }
  }

  return tokens
}
