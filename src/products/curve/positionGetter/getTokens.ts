import { NetworkConfig, Token, TokenData } from '../../../constants/types'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import ierc20Json from '../../../constants/metadata/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import { ADDRESS_ZERO, THEGRAPH_API_KEY, ZERO } from '../../../constants'
import { AddressZero } from '@ethersproject/constants'
import { ETHERSCAN_API_KEY } from '../../../constants'

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

import curveFactoryAbi from './_contracts/ICurveFactory.json'
import curveFactoryPoolAbi from './_contracts/ICurveFactoryPool.json'
import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
import curveRegistryAbi from './_contracts/ICurveRegistry.json'
import { queryDecimals, queryName, querySymbol } from '../../../utils/contract'

// const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'

const CurveFactoryAddress = '0x0959158b6040D32d04c301A72CBFD6b39E21c9AE'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  if (!metadata.user || !metadata.transferHistory) return []

  if (!provider) return []

  const client = new ApolloClient({
    uri: `https://api.thegraph.com/subgraphs/name/curvefi/curve`,
    cache: new InMemoryCache(),
  })

  const tokens: Token[] = []

  const basePools = await client
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

  const curveFactoryContract = getContract(CurveFactoryAddress, curveFactoryAbi, provider)
  const factoryPoolCount = await curveFactoryContract.pool_count()
  const indices = rangeFrom0(factoryPoolCount.toNumber())
  const _factoryPoolAddresses = await Promise.all(indices.map((i) => curveFactoryContract.pool_list(i)))

  const factoryPoolAddresses = _factoryPoolAddresses.map((addr: any) => addr.toLowerCase())
  const basedPoolAddresses = basePools.map((pool: any) => pool.lpToken.address.toLowerCase())

  const touchedBasedPoolAddresses = metadata.transferHistory
    .filter((r: any) => basedPoolAddresses.includes(r.contractAddress.toLowerCase()))
    .map((r: any) => r.contractAddress)

  const touchedFactoryPoolAddresses = metadata.transferHistory
    .filter((r: any) => factoryPoolAddresses.includes(r.contractAddress.toLowerCase()))
    .map((r: any) => r.contractAddress)

  const uniqueBasedPoolAddresses = touchedBasedPoolAddresses.filter(
    (item: string, index: number) => touchedBasedPoolAddresses.indexOf(item) == index
  )

  const uniqueFactoryPoolAddresses = touchedFactoryPoolAddresses.filter(
    (item: string, index: number) => touchedFactoryPoolAddresses.indexOf(item) == index
  )

  if (uniqueBasedPoolAddresses.length == 0 && uniqueFactoryPoolAddresses.length == 0) return []

  for (let i = 0; i < uniqueBasedPoolAddresses.length; i++) {
    const underlyingTokens = []
    const pool = basePools.find(
      (pool: any) => pool.lpToken.address.toLowerCase() == uniqueBasedPoolAddresses[i].toLowerCase()
    )

    // check if pool is found in based pool
    if (!pool) continue
    // it must be a base pool address
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
        // lpTokenName: pool.lpToken.name,
        gauges: pool.gauges,
        poolAddr: pool.id.toLowerCase(),
        isFactory: false,
      },
      tokenType: 'token',
    }
    tokens.push(token)
  }

  // time to check factory pools!

  const factoryPoolContracts: Contract[] = uniqueFactoryPoolAddresses.map((addr: any) =>
    getContract(addr, curveFactoryPoolAbi, provider)
  )

  const [fpNames, fpSymbols, fpDecimals, fpUnderlyingCoins] = await Promise.all([
    Promise.all(factoryPoolContracts.map((contract: Contract) => queryName(contract, provider))),
    Promise.all(factoryPoolContracts.map((contract: Contract) => querySymbol(contract, provider))),
    Promise.all(factoryPoolContracts.map((contract: Contract) => queryDecimals(contract))),
    Promise.all(
      factoryPoolContracts.map((contract: Contract) => curveFactoryContract.get_underlying_coins(contract.address))
    ),
  ])
  for (let i = 0; i < factoryPoolContracts.length; i++) {
    const underlyingCoins: string[] = fpUnderlyingCoins[i]
    const underlyingTokens: TokenData[] = []
    for (let j = 0; j < underlyingCoins.length; j++) {
      if (underlyingCoins[j] != ADDRESS_ZERO) {
        const underlyingTokenContract = getContract(underlyingCoins[j], ierc20Json.abi, provider)
        const [uName, uSymbol, uDecimals] = await Promise.all([
          await queryName(underlyingTokenContract, provider),
          await querySymbol(underlyingTokenContract, provider),
          await queryDecimals(underlyingTokenContract),
        ])
        const uToken = {
          address: underlyingCoins[j],
          name: uName,
          symbol: uSymbol,
          decimals: uDecimals,
          balance: ZERO,
        }
        underlyingTokens.push(uToken)
      }
    }
    const token: Token = {
      token: {
        address: factoryPoolContracts[i].address,
        name: fpNames[i],
        symbol: fpSymbols[i],
        decimals: fpDecimals[i],
        balance: ZERO,
      },
      underlying: underlyingTokens,
      eth: {
        balance: ZERO,
      },
      tokenType: 'token',
      metadata: {
        // lpTokenName: fpNames[i],
        poolAddr: factoryPoolContracts[i].address,
        isFactory: true,
      },
    }
    tokens.push(token)
  }

  return tokens
}
