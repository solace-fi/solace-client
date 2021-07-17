import { BigNumber, Contract } from 'ethers'

import { getTokens } from './getTokens'
import tokenJson from '../contracts/ICToken.json'
import { Token } from '../../../../constants/types'

import { withBackoffRetries, rangeFrom0, bnCmp, equalsIgnoreCase } from '../../..'
import { POW_EIGHTEEN } from '../../../../constants'
import axios from 'axios'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getBalances = async (user: string, provider: any): Promise<Token[]> => {
  // get ctoken balances
  const tokens = await getTokens(provider)
  let contracts = tokens.map((token) => new Contract(token.token.address, tokenJson.abi, provider))
  const queriedBalances = await Promise.all(contracts.map((contract) => queryBalance(user, contract)))
  let indices = rangeFrom0(tokens.length)
  indices.forEach((i) => (tokens[i].token.balance = queriedBalances[i]))
  const balances: Token[] = tokens.filter((token) => token.token.balance.gt(0))

  // get utoken balances
  indices = rangeFrom0(balances.length)
  contracts = balances.map((balance) => new Contract(balance.token.address, tokenJson.abi, provider))
  const exchangeRates = await Promise.all(contracts.map((contract) => queryExchangeRate(contract)))
  indices.forEach(
    (i) => (balances[i].underlying.balance = balances[i].token.balance.mul(exchangeRates[i]).div(String(POW_EIGHTEEN)))
  )

  const ethAmounts = await Promise.all(balances.map((balance) => queryEthBalance(balance.underlying)))

  //get eth balances
  indices.forEach((i) => (balances[i].eth.balance = ethAmounts[i]))
  balances.sort((balanceA, balanceB) => bnCmp(balanceA.eth.balance, balanceB.eth.balance))
  return balances
}

const queryBalance = async (user: string, tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.balanceOf(user))
}

const queryExchangeRate = async (tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.exchangeRateStored())
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
const queryEthBalance = async (token: any) => {
  if (equalsIgnoreCase(token.address, ETH)) return BigNumber.from(token.balance)
  const address = rmumap[token.address.toLowerCase()]
  const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${address}&toTokenAddress=${ETH}&amount=${token.balance.toString()}`
  const res = await withBackoffRetries(async () => axios.get(url))
  return BigNumber.from(res.data.toTokenAmount)
}
