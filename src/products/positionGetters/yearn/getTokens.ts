import { NetworkConfig, Token } from '../../../constants/types'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ZERO } from '../../../constants'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { capitalizeFirstLetter } from '../../../utils/formatting'
import { withBackoffRetries } from '../../../utils/time'
import { vaultAbi, yregistryAbi } from './_contracts/yearnAbis'
import { BigNumber } from 'ethers'

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  // TODO: reduce the ~1000 requests down
  if (!provider || !metadata.user) return []
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

  //   const balance = await vaultContract.balanceOf(metadata.user)

  //   if (balance.gt(ZERO)) {
  //     const uTokenContract = uTokenContracts[i]

  //     const vName = await vaultContract.name()
  //     const vSymbol = await vaultContract.symbol()
  //     const vDecimals = await vaultContract.decimals()
  //     const uName = await uTokenContract.name()
  //     const uSymbol = await uTokenContract.symbol()
  //     const uDecimals = await uTokenContract.decimals()

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
  const bigNumTokens = await yregistry.numTokens()
  const numTokens = bigNumTokens.toNumber()
  const tokenCount = rangeFrom0(numTokens)

  const uTokenAddrs = await Promise.all(tokenCount.map((i) => yregistry.tokens(BigNumber.from(tokenCount[i]))))
  const vaultAddrs = await Promise.all(uTokenAddrs.map((token) => yregistry.latestVault(token)))

  const [vaultContracts, uTokenContracts] = await Promise.all([
    Promise.all(vaultAddrs.map((addr: any) => getContract(addr, vaultAbi, provider))),
    Promise.all(uTokenAddrs.map((addr: any) => getContract(addr, ierc20Json.abi, provider))),
  ])

  const [vNames, vSymbols, vDecimals, uNames, uSymbols, uDecimals] = await Promise.all([
    Promise.all(vaultContracts.map((contract: any) => queryTokenName(contract))),
    Promise.all(vaultContracts.map((contract: any) => queryTokenSymbol(contract))),
    Promise.all(vaultContracts.map((contract: any) => queryTokenDecimals(contract))),
    Promise.all(uTokenContracts.map((contract: any) => queryTokenName(contract))),
    Promise.all(uTokenContracts.map((contract: any) => queryTokenSymbol(contract))),
    Promise.all(uTokenContracts.map((contract: any) => queryTokenDecimals(contract))),
  ])
  const indices = rangeFrom0(vaultAddrs.length)
  indices.forEach((i) => {
    tokens.push({
      token: {
        address: vaultAddrs[i],
        name: capitalizeFirstLetter(vNames[i]),
        symbol: vSymbols[i],
        decimals: vDecimals[i],
        balance: ZERO,
      },
      underlying: [
        {
          address: uTokenAddrs[i],
          name: uNames[i],
          symbol: uSymbols[i],
          decimals: uDecimals[i],
          balance: ZERO,
        },
      ],
      eth: {
        balance: ZERO,
      },
    })
  })

  return tokens
}

const queryTokenName = async (tokenContract: any) => {
  return await withBackoffRetries(async () => tokenContract.name())
}

const queryTokenSymbol = async (tokenContract: any) => {
  return await withBackoffRetries(async () => tokenContract.symbol())
}

const queryTokenDecimals = async (tokenContract: any) => {
  return await withBackoffRetries(async () => tokenContract.decimals().then(numberify))
}
