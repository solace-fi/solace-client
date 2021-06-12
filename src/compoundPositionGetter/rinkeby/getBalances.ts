import { ethers, BigNumber, Contract } from 'ethers'

import tokens from './tokens.json'
import tokenJson from '../contracts/ICToken.json'

import { withBackoffRetries, delay, range } from '../../utils/positionGetter'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { POW_EIGHTEEN } from '../../constants'

const tempUser = '0x0fb78424e5021404093aA0cFcf50B176B30a3c1d'

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
  '0x577d296678535e4903d59a4c929b718e1d575e0a': '15405738054265288944', // WBTC
  '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02': '420072999319953', // USDT
  '0x6e894660985207feb7cf89faf048998c71e8ee89': '12449913804491249', // REP
  '0xbf7a7169562078c96f0ec1a8afd6ae50f12e5a99': '281485209795972', // BAT
  '0xddea378a6ddc8afec82c36e9b0078826bf9e68b6': '372925580282399', // ZRX
  '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': '205364954059859', // DAI
  '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b': '50000000000000', // USDC
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
