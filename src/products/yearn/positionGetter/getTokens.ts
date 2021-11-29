import { NetworkConfig, Token } from '../../../constants/types'
import { getContract } from '../../../utils'
import { queryBalance, queryDecimals, queryName, querySymbol } from '../../../utils/contract'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ZERO } from '../../../constants'
import ierc20Json from '../../../constants/metadata/IERC20Metadata.json'
import { capitalizeFirstLetter } from '../../../utils/formatting'
import { withBackoffRetries } from '../../../utils/time'
import { vaultAbi, yregistryAbi } from './_contracts/yearnAbis'
import { BigNumber, utils } from 'ethers'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  // TODO: reduce the ~1000 requests down
  if (!provider) return []
  if (!metadata.user) return []
  // const yRegistryAddress = await provider.resolveName('v2.registry.ychad.eth')
  const yRegistryAddress = '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804'
  if (!yRegistryAddress) return []

  const tokens: Token[] = []

  /*

  APOLLO RETRIEVAL

  */

  // const client = new ApolloClient({
  //   uri: 'https://api.thegraph.com/subgraphs/name/salazarguille/yearn-vaults-v2-subgraph-mainnet',
  //   cache: new InMemoryCache(),
  // })

  // const apolloData = await client
  //   .query({
  //     query: gql`
  //       query registries($registryAddr: String) {
  //         registries(where: { id: $registryAddr }) {
  //           id
  //           vaults {
  //             id
  //             shareToken {
  //               id
  //               name
  //               symbol
  //               decimals
  //             }
  //             token {
  //               id
  //               name
  //               symbol
  //               decimals
  //             }
  //           }
  //         }
  //       }
  //     `,
  //     variables: {
  //       registryAddr: yRegistryAddress.toLowerCase(),
  //     },
  //   })
  //   .then((result) => {
  //     return result.data
  //   })

  // const vaults = apolloData.registries[0].vaults
  // // console.log(
  // //   vaults.map((v: any) => {
  // //     return `${v.shareToken.name}`
  // //   })
  // // )

  // for (let i = 0; i < vaults.length; i++) {
  //   const token = {
  //     token: {
  //       address: vaults[i].shareToken.id,
  //       name: vaults[i].shareToken.name,
  //       symbol: vaults[i].shareToken.symbol,
  //       decimals: vaults[i].shareToken.decimals,
  //       balance: ZERO,
  //     },
  //     underlying: [
  //       {
  //         address: vaults[i].token.id,
  //         name: vaults[i].token.name,
  //         symbol: vaults[i].token.symbol,
  //         decimals: vaults[i].token.decimals,
  //         balance: ZERO,
  //       },
  //     ],
  //     eth: {
  //       balance: ZERO,
  //     },
  //   }
  //   tokens.push(token)
  // }

  /*

  MANUAL RETRIEVAL

  */

  // const yregistry = getContract(yRegistryAddress, yregistryAbi, provider)
  // const bigNumTokens = await yregistry.numTokens()
  // const numTokens = bigNumTokens.toNumber()
  // const tokenCount = rangeFrom0(numTokens)

  // const uTokenAddrs = await Promise.all(tokenCount.map((i) => yregistry.tokens(BigNumber.from(tokenCount[i]))))
  // const uTokenContracts = uTokenAddrs.map((addr: any) => getContract(addr, ierc20Json.abi, provider))

  // const vaultAddrs = await Promise.all(uTokenAddrs.map((token) => yregistry.latestVault(token)))
  // const vaultContracts = vaultAddrs.map((addr: any) => getContract(addr, vaultAbi, provider))

  // for (let i = 0; i < vaultContracts.length; i++) {
  //   const vaultContract = vaultContracts[i]

  //   const balance = await queryBalance(vaultContract, metadata.user)

  //   if (balance.gt(ZERO)) {
  //     const uTokenContract = uTokenContracts[i]

  //     const vName = await queryName(vaultContract, provider)
  //     const vSymbol = await querySymbol(vaultContract, provider)
  //     const vDecimals = await queryDecimals(vaultContract)
  //     const uName = await queryName(uTokenContract, provider)
  //     const uSymbol = await querySymbol(uTokenContract, provider)
  //     const uDecimals = await queryDecimals(uTokenContract)

  //     const token = {
  //       token: {
  //         address: vaultAddrs[i],
  //         name: capitalizeFirstLetter(vName),
  //         symbol: vSymbol,
  //         decimals: vDecimals,
  //         balance: ZERO,
  //       },
  //       underlying: [
  //         {
  //           address: uTokenAddrs[i],
  //           name: uName,
  //           symbol: uSymbol,
  //           decimals: uDecimals,
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

  /*

  BATCH RETRIEVAL

  */

  const yregistry = getContract(yRegistryAddress, yregistryAbi, provider)
  const bigNumTokens = await yregistry.numTokens().catch((e: any) => {
    console.log('registry.numTokens() for Yearn failed', e)
    return ZERO
  })
  const numTokens = bigNumTokens.toNumber()
  const tokenCount = rangeFrom0(numTokens)

  const uTokenAddrs = await Promise.all(
    tokenCount.map((i) =>
      yregistry.tokens(BigNumber.from(tokenCount[i])).catch((e: any) => {
        console.log('registry.tokens() for Yearn failed', e)
      })
    )
  )
  const vaultAddrs = await Promise.all(
    uTokenAddrs.map((token) =>
      yregistry.latestVault(token).catch((e: any) => {
        console.log('registry.latestVault() for Yearn failed', e)
      })
    )
  )

  const [vaultContracts, uTokenContracts] = await Promise.all([
    Promise.all(vaultAddrs.map((addr: any) => getContract(addr, vaultAbi, provider))),
    Promise.all(uTokenAddrs.map((addr: any) => getContract(addr, ierc20Json.abi, provider))),
  ])

  const [vNames, vSymbols, vDecimals, uNames, uSymbols, uDecimals] = await Promise.all([
    Promise.all(vaultContracts.map(queryName)),
    Promise.all(vaultContracts.map(querySymbol)),
    Promise.all(vaultContracts.map(queryDecimals)),
    Promise.all(uTokenContracts.map(queryName)),
    Promise.all(uTokenContracts.map(querySymbol)),
    Promise.all(uTokenContracts.map(queryDecimals)),
  ])

  const indices = rangeFrom0(vaultAddrs.length)
  indices.forEach((i) => {
    const token: Token = {
      token: {
        address: vaultAddrs[i].toLowerCase(),
        name: capitalizeFirstLetter(vNames[i]),
        symbol: vSymbols[i],
        decimals: vDecimals[i],
        balance: ZERO,
      },
      underlying: [
        {
          address: uTokenAddrs[i].toLowerCase(),
          name: uNames[i],
          symbol: uSymbols[i],
          decimals: uDecimals[i],
          balance: ZERO,
        },
      ],
      eth: {
        balance: ZERO,
      },
      tokenType: 'token',
    }
    tokens.push(token)
  })
  return tokens
}
