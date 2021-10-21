import { NetworkConfig, Token, TokenData } from '../../../constants/types'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import ierc20Json from '../../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ADDRESS_ZERO, THEGRAPH_API_KEY, ZERO } from '../../../constants'
import { AddressZero } from '@ethersproject/constants'
import { ETHERSCAN_API_KEY } from '../../../constants'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
import curveRegistryAbi from './_contracts/ICurveRegistry.json'

// const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  if (!metadata.user || !metadata.transferHistory) return []

  if (!provider) return []

  const client = new ApolloClient({
    uri: `https://api.thegraph.com/subgraphs/name/curvefi/curve`,
    cache: new InMemoryCache(),
  })

  const tokens: Token[] = []

  const apolloData = await client
    .query({
      query: gql`
        query pools {
          pools {
            id
            name
            gauges {
              address
            }
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

  const allPoolAddresses = apolloData.map((pool: any) => pool.lpToken.address.toLowerCase())

  const touchedPoolAddresses = metadata.transferHistory
    .filter((r: any) => allPoolAddresses.includes(r.contractAddress.toLowerCase()))
    .map((r: any) => r.contractAddress)

  if (touchedPoolAddresses.length == 0) return []

  const uniquePoolAddresses = touchedPoolAddresses.filter(
    (item: string, index: number) => touchedPoolAddresses.indexOf(item) == index
  )

  for (let i = 0; i < uniquePoolAddresses.length; i++) {
    const underlyingTokens = []
    const pool = apolloData.find(
      (pool: any) => pool.lpToken.address.toLowerCase() == uniquePoolAddresses[i].toLowerCase()
    )
    if (!pool) continue

    for (let j = 0; j < pool.underlyingCoins.length; j++) {
      const name = pool.underlyingCoins[j].token.name
      const symbol = pool.underlyingCoins[j].token.symbol
      const decimals = pool.underlyingCoins[j].token.decimals
      const address = pool.underlyingCoins[j].token.address
      if (!(name == '' && address == AddressZero)) {
        underlyingTokens.push({
          address: pool.underlyingCoins[j].token.address.toLowerCase(),
          name: name,
          symbol: symbol,
          decimals: decimals,
          balance: ZERO,
        })
      }
    }

    const token: Token = {
      token: {
        address: pool.lpToken.address.toLowerCase(),
        name: pool.name,
        symbol: pool.lpToken.symbol,
        decimals: parseInt(pool.lpToken.decimals),
        balance: ZERO,
      },
      underlying: underlyingTokens,
      eth: {
        balance: ZERO,
      },
      metadata: {
        lpTokenName: pool.lpToken.name,
        gauges: pool.gauges,
        poolAddr: pool.id.toLowerCase(),
      },
      tokenType: 'token',
    }
    tokens.push(token)
  }
  return tokens
}
