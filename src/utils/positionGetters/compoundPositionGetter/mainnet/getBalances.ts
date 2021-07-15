import { BigNumber, Contract } from 'ethers'

import { getTokens } from './getTokens'
import tokenJson from '../contracts/ICToken.json'

import { withBackoffRetries, rangeFrom0, bnCmp, equalsIgnoreCase } from '../../../'
import { POW_EIGHTEEN } from '../../../../constants'
import axios from 'axios'

type Token = {
  token: {
    address: string
    name: string
    symbol: string
    decimals: number
    balance: BigNumber
  }
  underlying: {
    address: string
    name: string
    symbol: string
    decimals: number
    balance: BigNumber
  }
  eth: {
    balance: BigNumber
  }
}

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getBalances = async (user: string, provider: any) => {
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

  //get eth balances
  const ethAmounts = await Promise.all(balances.map((balance) => queryEthBalance(balance.underlying)))

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

const queryEthBalance = async (token: any) => {
  if (equalsIgnoreCase(token.address, ETH)) return BigNumber.from(token.balance)
  const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${
    token.address
  }&toTokenAddress=${ETH}&amount=${token.balance.toString()}`
  const res = await withBackoffRetries(async () => axios.get(url))
  return BigNumber.from(res.data.toTokenAmount)
}
