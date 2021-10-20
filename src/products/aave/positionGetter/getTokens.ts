import { providers } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { ZERO } from '../../../constants'
import { NetworkConfig, Token } from '../../../constants/types'
import ierc20Json from '../../_contracts/IERC20Metadata.json'
import { AaveProtocolDataProviderFactory } from './_contracts/AaveProtocolDataProviderFactory'
import { withBackoffRetries } from '../../../utils/time'
import { equalsIgnoreCase } from '../../../utils'

const KEY = process.env.REACT_APP_ALCHEMY_API_KEY
if (KEY === '') throw new Error('ENV ALCHEMY KEY not configured')

type Market = {
  market: string
  nodeUrl: string
  protocolDataProviderAddress: string
}

const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

const NETWORKS_CONFIG: any = {
  '1': [
    {
      market: 'proto',
      nodeUrl: `https://eth-mainnet.alchemyapi.io/v2/${KEY}`,
      protocolDataProviderAddress: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
    },
    {
      market: 'amm',
      nodeUrl: `https://eth-mainnet.alchemyapi.io/v2/${KEY}`,
      protocolDataProviderAddress: '0xc443ad9dde3cecfb9dfc5736578f447afe3590ba',
    },
  ],
  '42': [
    {
      market: 'proto',
      nodeUrl: `https://eth-kovan.alchemyapi.io/v2/${KEY}`,
      protocolDataProviderAddress: '0x3c73a5e5785cac854d468f727c606c07488a29d6',
    },
  ],
  '137': [
    {
      market: 'matic',
      nodeUrl: `https://rpc-mainnet.matic.network`,
      protocolDataProviderAddress: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
    },
  ],
} as const

const generateTokensData = async (
  chainId: number,
  nodeUrl: string,
  market: string,
  protocolDataProviderAddress: string
): Promise<Token[]> => {
  const provider = new providers.JsonRpcProvider(nodeUrl)
  const helperContract = AaveProtocolDataProviderFactory.connect(protocolDataProviderAddress, provider)

  try {
    const [tokens, aTokens] = await Promise.all([helperContract.getAllReservesTokens(), helperContract.getAllATokens()])
    const promises = tokens.map(async (token, index) => {
      const [config] = await Promise.all([helperContract.getReserveConfigurationData(token.tokenAddress)])

      const aToken = aTokens[index]
      const aTokenContract = new Contract(aToken.tokenAddress, ierc20Json.abi, provider)
      const tokenContract = new Contract(token.tokenAddress, ierc20Json.abi, provider)
      const [aTokenName, tokenName] = await Promise.all([queryTokenName(aTokenContract), queryTokenName(tokenContract)])

      const _token: Token = {
        token: {
          address: aToken.tokenAddress,
          name: aTokenName,
          symbol: aToken ? aToken.symbol : '',
          decimals: config.decimals.toNumber(),
          balance: ZERO,
        },
        underlying: [
          {
            address: token.tokenAddress,
            name: tokenName,
            symbol: token.symbol,
            decimals: config.decimals.toNumber(),
            balance: ZERO,
          },
        ],
        eth: {
          balance: ZERO,
        },
        tokenType: 'token',
      }
      return _token
    })

    const result = await Promise.all(promises)
    return result
  } catch (error) {
    console.error(`Error network : ${chainId}`, error)
    return []
  }
}

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  if (!provider) return []
  let allTokens: Token[] = []
  if (NETWORKS_CONFIG[String(activeNetwork.chainId)] == undefined) return []
  await Promise.all(
    NETWORKS_CONFIG[String(activeNetwork.chainId)].map((marketConfig: Market) =>
      generateTokensData(
        activeNetwork.chainId,
        marketConfig.nodeUrl,
        marketConfig.market,
        marketConfig.protocolDataProviderAddress
      ).then((marketTokens: Token[]) => (allTokens = allTokens.concat(marketTokens)))
    )
  )
  return allTokens
}

const queryTokenName = async (tokenContract: any) => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 'Ether'
  return await withBackoffRetries(async () => tokenContract.name())
}
