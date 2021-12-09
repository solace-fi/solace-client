import { BigNumber } from 'ethers'
import { Token, TokenData } from '../constants/types'
import { ChainId, AddressMap } from '@sushiswap/sdk'

export const zapperNetworks: AddressMap = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.MATIC]: 'polygon',
  [10]: 'optimism',
  [ChainId.XDAI]: 'xdai',
  [ChainId.BSC]: 'binance-smart-chain',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.AVALANCHE]: 'avalanche',
  [ChainId.ARBITRUM]: 'arbitrum',
  [ChainId.CELO]: 'celo',
  [ChainId.HARMONY]: 'harmony',
}

export const createZapperBalanceMap = (
  zapperProtocolBalancesData: any,
  user: string,
  nativePrice: number,
  nativeDecimals: number,
  tokens: Token[],
  existingTokenMap?: Map<string, Token>
): Map<string, Token> => {
  // use an existing map or empty map
  const tokenMap = existingTokenMap ?? new Map<string, Token>()

  // access values using user as key
  const userData = zapperProtocolBalancesData[`${user.toLowerCase()}`]
  if (!userData) return tokenMap
  const products = userData.products
  if (products.length == 0) return tokenMap

  // use first element of products array, since we want balances of only one protocol
  const userAssets = products[0].assets

  // iterate assets such as vaults, farms, or pools
  for (let i = 0; i < userAssets.length; i++) {
    const tokenInfo = userAssets[i].tokens[0]
    const underlyingTokens: TokenData[] = []

    // convert asset's balanceUSD value to eth
    const balanceUSD = tokenInfo.balanceUSD
    const ethBalance = balanceUSD / nativePrice
    const wei = ethBalance * Math.pow(10, nativeDecimals)
    const formattedEthBalance = BigNumber.from(Math.floor(wei).toString())

    const foundToken = tokens.find((t) => t.token.address.toLowerCase() == tokenInfo.address.toLowerCase())

    // get underlying tokens/assets
    for (let j = 0; j < tokenInfo.tokens.length; j++) {
      const uTokenData = tokenInfo.tokens[j]
      const uToken: TokenData = {
        address: uTokenData.address,
        name: foundToken?.underlying[j].name ?? tokenInfo.symbol,
        decimals: uTokenData.decimals,
        symbol: uTokenData.symbol,
        balance: BigNumber.from(uTokenData.balanceRaw),
      }
      underlyingTokens.push(uToken)
    }

    // create token obj
    const token: Token = {
      eth: {
        balance: formattedEthBalance,
      },
      token: {
        address: tokenInfo.address,
        name: foundToken?.token.name ?? tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        symbol: tokenInfo.symbol,
        balance: BigNumber.from(tokenInfo.balanceRaw),
      },
      underlying: underlyingTokens,
      tokenType: tokenInfo.type == 'nft' ? 'nft' : 'token',
      metadata: {
        balanceUSD: balanceUSD,
      },
    }

    // check if token exists in map already
    const mappedToken = tokenMap.get(token.token.symbol)
    if (!mappedToken) {
      // if token does not exist yet, add it into map
      tokenMap.set(token.token.symbol, token)
    } else {
      // if token already exists, update the mapped token's balances
      const newMappedToken = mappedToken
      newMappedToken.eth.balance = mappedToken.eth.balance.add(formattedEthBalance)
      newMappedToken.token.balance = mappedToken.token.balance.add(BigNumber.from(tokenInfo.balanceRaw))
      newMappedToken.underlying = mappedToken.underlying.map((u: TokenData, k) => {
        return {
          ...u,
          balance: u.balance.add(underlyingTokens[k].balance),
        }
      })
      newMappedToken.metadata.balanceUSD += balanceUSD
      tokenMap.set(token.token.symbol, newMappedToken)
    }
  }
  return tokenMap
}
