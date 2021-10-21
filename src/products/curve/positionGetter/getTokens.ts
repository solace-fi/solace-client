import { NetworkConfig, Token, TokenData } from '../../../constants/types'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import ierc20Json from '../../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ADDRESS_ZERO, ZERO } from '../../../constants'
import { AddressZero } from '@ethersproject/constants'
import { ETHERSCAN_API_KEY } from '../../../constants'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
import curveRegistryAbi from './_contracts/ICurveRegistry.json'

// const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  // if (!metadata.user || !metadata.transferHistory) return []

  if (!provider) return []

  const client = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/curvefi/curve',
    cache: new InMemoryCache(),
  })

  // const curveAddressProviderContract = getContract(CURVE_ADDRRESS_PROVIDER_ADDR, curveAddressProviderAbi.abi, provider)

  // let registryAddr = null
  // let curveRegistryContract = null

  // const bigNumPoolCount: BigNumber = await curveRegistryContract.pool_count()

  const tokens: Token[] = []

  const apolloData = await client
    .query({
      query: gql`
        query pools {
          pools {
            id
            name
            lpToken {
              address
              symbol
              name
              decimals
            }
            underlyingCoins {
              token {
                address
                name
                decimals
                symbol
              }
            }
          }
        }
      `,
    })
    .then((result) => {
      return result.data.pools
    })
    .catch((e) => {
      console.log('apollo fetch at curve.getTokens failed', e)
      return []
    })

  for (let i = 0; i < apolloData.length; i++) {
    const underlyingTokens = []

    for (let j = 0; j < apolloData[i].underlyingCoins.length; j++) {
      const name = apolloData[i].underlyingCoins[j].token.name
      const symbol = apolloData[i].underlyingCoins[j].token.symbol
      const decimals = apolloData[i].underlyingCoins[j].token.decimals
      const address = apolloData[i].underlyingCoins[j].token.address
      if (!(name == '' && address == AddressZero)) {
        underlyingTokens.push({
          address: apolloData[i].underlyingCoins[j].token.address.toLowerCase(),
          name: name,
          symbol: symbol,
          decimals: decimals,
          balance: ZERO,
        })
      }
    }

    const token: Token = {
      token: {
        address: apolloData[i].lpToken.address.toLowerCase(),
        name: apolloData[i].name,
        symbol: apolloData[i].lpToken.symbol,
        decimals: parseInt(apolloData[i].lpToken.decimals),
        balance: ZERO,
      },
      underlying: underlyingTokens,
      eth: {
        balance: ZERO,
      },
      metadata: {
        lpTokenName: apolloData[i].lpToken.name,
      },
      tokenType: 'token',
    }
    tokens.push(token)
  }
  return tokens
}
