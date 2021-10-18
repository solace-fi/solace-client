import { NetworkConfig, Token, TokenData } from '../../../constants/types'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ADDRESS_ZERO, ZERO } from '../../../constants'
import { AddressZero } from '@ethersproject/constants'
import { ETHERSCAN_API_KEY } from '../../../constants'

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'

import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
import curveRegistryAbi from './_contracts/ICurveRegistry.json'

// const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'

// const mainnetCurveLpNames = [
//   'Curve.fi DAI/USDC/USDT',
//   'Curve.fi aDAI/aUSDC/aUSDT',
//   'Curve.fi ETH/aETH',
//   'Curve.fi yDAI/yUSDC/yUSDT/yBUSD',
//   'Curve.fi cDAI/cUSDC',
//   'Curve.fi EURS/sEUR',
//   'Curve.fi hBTC/wBTC',
//   'Curve.fi cyDAI/cyUSDC/cyUSDT',
//   'Curve.fi LINK/sLINK',
//   'Curve.fi DAI/USDC/USDT/PAX',
//   'Curve.fi renBTC/wBTC',
//   'Curve.fi aDAI/aSUSD',
//   'Curve.fi renBTC/wBTC/sBTC',
//   'Curve.fi ETH/sETH',
//   'Curve.fi ETH/stETH',
//   'Curve.fi DAI/USDC/USDT/sUSD',
//   'Curve.fi cDAI/cUSDC/USDT',
//   'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
//   'Curve.fi DUSD/3Crv',
//   'Curve.fi GUSD/3Crv',
//   'Curve.fi HUSD/3Crv',
//   'Curve.fi LinkUSD/3Crv',
//   'Curve.fi MUSD/3Crv',
//   'Curve.fi RSV/3Crv',
//   'Curve.fi USDK/3Crv',
//   'Curve.fi USDN/3Crv',
//   'Curve.fi USDP/3Crv',
//   'Curve.fi UST/3Crv',
//   'Curve.fi bBTC/sbtcCRV',
//   'Curve.fi oBTC/sbtcCRV',
//   'Curve.fi pBTC/sbtcCRV',
//   'Curve.fi tBTC/sbtcCrv',
//   'Curve.fi Factory USD Metapool: TrueUSD',
//   'Curve.fi Factory USD Metapool: Liquity',
//   'Curve.fi Factory USD Metapool: Frax',
//   'Curve.fi Factory USD Metapool: Binance USD',
//   'Curve.fi ETH/rETH',
//   'Curve.fi Factory USD Metapool: Alchemix USD',
//   'Curve.fi USD-BTC-ETH',
//   'Curve.fi Factory USD Metapool: Magic Internet Money 3Pool',
//   'Curve.fi Factory Plain Pool: Euro Tether',
// ]

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
      return result.data
    })

  for (let i = 0; i < apolloData.pools.length; i++) {
    const underlyingTokens = []

    for (let j = 0; j < apolloData.pools[i].underlyingCoins.length; j++) {
      const name = apolloData.pools[i].underlyingCoins[j].token.name
      const symbol = apolloData.pools[i].underlyingCoins[j].token.symbol
      const decimals = apolloData.pools[i].underlyingCoins[j].token.decimals
      const address = apolloData.pools[i].underlyingCoins[j].token.address
      if (!(name == '' && address == AddressZero)) {
        underlyingTokens.push({
          address: apolloData.pools[i].underlyingCoins[j].token.address,
          name: name,
          symbol: symbol,
          decimals: decimals,
          balance: ZERO,
        })
      }
    }
    const token = {
      token: {
        address: apolloData.pools[i].lpToken.address,
        name: apolloData.pools[i].name,
        symbol: apolloData.pools[i].lpToken.symbol,
        decimals: parseInt(apolloData.pools[i].lpToken.decimals),
        balance: ZERO,
      },
      underlying: underlyingTokens,
      eth: {
        balance: ZERO,
      },
    }
    tokens.push(token)
  }
  return tokens
}
