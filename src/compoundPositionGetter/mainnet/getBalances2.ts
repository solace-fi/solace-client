import { ethers, BigNumber, Contract } from 'ethers'

import tokens from './tokens.json'
import tokenJson from '../contracts/ICToken.json'

import { withBackoffRetries, delay, range } from '../../utils/positionGetter'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { POW_EIGHTEEN } from '../../constants'

const tempUser = '0xa0f75491720835b36edc92d06ddc468d201e9b73'

type Token = {
  token: {
    address: string
    name: string
    symbol: string
    decimals: number
    balance: string
  }
  underlying: {
    address: string
    name: string
    symbol: string
    decimals: number
    balance: string
  }
  eth: {
    balance: string
  }
}

export const getBalances = async (user: string, provider: any) => {
  // get ctoken balances
  var contracts = tokens.map((token) => new Contract(token.token.address, tokenJson.abi, provider))
  const queriedBalances = await Promise.all(contracts.map((contract) => queryBalance(user, contract)))
  var indices = range(tokens.length)
  indices.forEach((i) => (tokens[i].token.balance = formatEther(queriedBalances[i])))
  const balances: Token[] = tokens.filter((token) => parseEther(token.token.balance).gt(0))

  // get utoken balances
  indices = range(balances.length)
  contracts = balances.map((balance) => new ethers.Contract(balance.token.address, tokenJson.abi, provider))
  var exchangeRates = await Promise.all(contracts.map((contract) => queryExchangeRate(contract)))
  indices.forEach(
    (i) =>
      (balances[i].underlying.balance = formatEther(
        parseEther(tokens[i].token.balance).mul(exchangeRates[i]).div(String(POW_EIGHTEEN))
      ))
  )

  //get eth balances
  balances.forEach((bal) => (bal.eth = { ...bal.eth, balance: queryEthBalance(bal.underlying) }))
  return balances
}

const queryBalance = async (user: string, tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.balanceOf(user))
}

const queryExchangeRate = async (tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.exchangeRateStored())
}

const rates: any = {
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '1000000000000000000', // ETH
  '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': '5214879005539865', // SAI
  '0xc00e94cb662c3520282e6f5717214004a7f26888': '131044789678131649', // COMP
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': '9259278326749300', // UNI
  '0x514910771af9ca656af840dff83e8264ecf986ca': '9246653217422099', // LINK
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '15405738054265288944', // WBTC
  '0xdac17f958d2ee523a2206206994597c13d831ec7': '420072999319953', // USDT
  '0x1985365e9f78359a9b6ad760e32412f4a445e862': '12449913804491249', // REP
  '0x0d8775f648430679a709e98d2b0cb6250d2887ef': '281485209795972', // BAT
  '0xe41d2489571d322189246dafa5ebde1f4699f498': '372925580282399', // ZRX
  '0x0000000000085d4780b73119b644ae5ecd22b376': '419446558886231', // TUSD
  '0x6b175474e89094c44da98b954eedeac495271d0f': '205364954059859', // DAI
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '50000000000000', // USDC
}

function queryEthBalance(token: any): string {
  var address = token.address.toLowerCase()
  if (Object.keys(rates).includes(address))
    return formatEther(parseEther(token.balance).mul(rates[address]).div(decimals(token.decimals)))
  else return '0'
}

const decimals = (d: number) => {
  var s = '1'
  for (var i = 0; i < d; ++i) {
    s = `${s}0`
  }
  return s
}
