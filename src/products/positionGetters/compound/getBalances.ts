import tokenJson from './contracts/ICToken.json'
import { rangeFrom0 } from '../../../utils/numeric'
import { NetworkCache, NetworkConfig, Token } from '../../../constants/types'
import { addNativeTokenBalances, getProductTokenBalances } from '../getBalances'
import { ProductName } from '../../../constants/enums'
import { Contract } from '@ethersproject/contracts'
import { getNonHumanValue } from '../../../utils/formatting'
import { withBackoffRetries } from '../../../utils/time'

export const getBalances = async (
  user: string,
  provider: any,
  cache: NetworkCache,
  activeNetwork: NetworkConfig
): Promise<Token[]> => {
  // get ctoken balances
  const savedTokens = cache.tokens[ProductName.COMPOUND].savedTokens
  const balances: Token[] = await getProductTokenBalances(user, tokenJson.abi, savedTokens, provider)

  // get utoken balances
  const indices = rangeFrom0(balances.length)
  const contracts = balances.map((balance) => new Contract(balance.token.address, tokenJson.abi, provider))
  const exchangeRates = await Promise.all(contracts.map((contract) => queryExchangeRate(contract)))
  indices.forEach(
    (i) =>
      (balances[i].underlying.balance = balances[i].token.balance
        .mul(exchangeRates[i])
        .div(String(getNonHumanValue(1, activeNetwork.nativeCurrency.decimals))))
  )

  // get native token balances
  const tokenBalances = await addNativeTokenBalances(balances, indices, cache.chainId, getMainNetworkTokenAddress)
  return tokenBalances
}

// rinkeby => mainnet underlying token map
const rmumap: any = {
  '0xbf7a7169562078c96f0ec1a8afd6ae50f12e5a99': '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  '0x6e894660985207feb7cf89faf048998c71e8ee89': '0x1985365e9f78359a9b6ad760e32412f4a445e862',
  '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02': '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0x577d296678535e4903d59a4c929b718e1d575e0a': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0xddea378a6ddc8afec82c36e9b0078826bf9e68b6': '0xe41d2489571d322189246dafa5ebde1f4699f498',
}

const getMainNetworkTokenAddress = (address: string, chainId: number): string => {
  if (chainId == 4) {
    return rmumap[address.toLowerCase()]
  }
  return address.toLowerCase()
}

const queryExchangeRate = async (tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.exchangeRateStored())
}
