import { providers } from 'ethers'
import { ZERO } from '../../../constants'
import { AaveProtocolDataProviderFactory } from './contracts/AaveProtocolDataProviderFactory'
const KEY = process.env.REACT_APP_ALCHEMY_API_KEY
if (KEY === '') throw new Error('ENV ALCHEMY KEY not configured')

const NETWORKS_CONFIG = {
  mainnet: [
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
  kovan: [
    {
      market: 'proto',
      nodeUrl: `https://eth-kovan.alchemyapi.io/v2/${KEY}`,
      protocolDataProviderAddress: '0x3c73a5e5785cac854d468f727c606c07488a29d6',
    },
  ],
} as const

const generateTokensData = async (
  network: string,
  nodeUrl: string,
  market: string,
  protocolDataProviderAddress: string
) => {
  const provider = new providers.JsonRpcProvider(nodeUrl)
  const helperContract = AaveProtocolDataProviderFactory.connect(protocolDataProviderAddress, provider)

  try {
    const [tokens, aTokens] = await Promise.all([helperContract.getAllReservesTokens(), helperContract.getAllATokens()])

    const promises = tokens.map(async (token) => {
      const [reserve, config] = await Promise.all([
        helperContract.getReserveTokensAddresses(token.tokenAddress),
        helperContract.getReserveConfigurationData(token.tokenAddress),
      ])

      const aToken = aTokens.find((aToken) => aToken.tokenAddress === reserve.aTokenAddress)

      return {
        aTokenAddress: reserve.aTokenAddress,
        aTokenSymbol: aToken ? aToken.symbol : '',
        stableDebtTokenAddress: reserve.stableDebtTokenAddress,
        variableDebtTokenAddress: reserve.variableDebtTokenAddress,
        symbol: token.symbol,
        address: token.tokenAddress,
        decimals: config.decimals.toNumber(),
      }
      //   return {
      //     token: {
      //       address: reserve.aTokenAddress,
      //       name: 'non',
      //       symbol: aToken ? aToken.symbol : '',
      //       decimals: config.decimals.toNumber(),
      //       balance: ZERO,
      //     },
      //     underlying: {
      //       address: token.tokenAddress,
      //       name: 'non',
      //       symbol: token.symbol,
      //       decimals: config.decimals.toNumber(),
      //       balance: ZERO,
      //     },
      //     eth: {
      //       balance: ZERO,
      //     },
      //   }
    })

    const result = await Promise.all(promises)
    return { [market]: result }
  } catch (error) {
    console.error(`Error network : ${network}`, error)
    return null
  }
}

export const getTokens = async () => {
  for (const network of Object.keys(NETWORKS_CONFIG) as ('mainnet' | 'kovan')[]) {
    const data = await Promise.all(
      NETWORKS_CONFIG[network].map((config: any) => {
        return generateTokensData(network, config.nodeUrl, config.market, config.protocolDataProviderAddress)
      })
    )

    console.log(data)
  }
}
