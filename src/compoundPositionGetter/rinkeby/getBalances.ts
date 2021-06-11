const { ethers, BigNumber, Contract } = require('ethers')
const BN = BigNumber
const axios = require('axios')
const fs = require('fs')
const { config } = require('dotenv')
config()

var key, provider, tokens, tokenJson
var user = '0x0fb78424e5021404093aA0cFcf50B176B30a3c1d'

async function getBalances(user) {
  key = process.env.REACT_APP_ALCHEMY_API_KEY
  provider = new ethers.providers.AlchemyProvider('rinkeby', key)
  ;[tokens, tokenJson] = await Promise.all([
    fs.promises.readFile('tokens.json').then(JSON.parse), // TODO: use api
    fs.promises.readFile('../contracts/ICToken.json').then(JSON.parse),
  ])
  // get ctoken balances
  var contracts = tokens.map((token) => new ethers.Contract(token.token.address, tokenJson.abi, provider))
  var balances = await Promise.all(contracts.map((contract) => queryBalance(user, contract)))
  var indices = range(tokens.length)
  indices.forEach((i) => (tokens[i].token.balance = balances[i]))
  balances = tokens.filter((token) => token.token.balance.gt(0))
  // get utoken balances
  indices = range(balances.length)
  contracts = balances.map((balance) => new ethers.Contract(balance.token.address, tokenJson.abi, provider))
  var exchangeRates = await Promise.all(contracts.map((contract) => queryExchangeRate(contract)))
  indices.forEach(
    (i) => (balances[i].underlying.balance = balances[i].token.balance.mul(exchangeRates[i]).div('1000000000000000000'))
  )
  // get eth balances
  balances.forEach((balance) => (balance.eth = { balance: queryEthBalance(balance.underlying) }))
  return balances
}

async function queryBalance(user, tokenContract) {
  return await withBackoffRetries(async () => tokenContract.balanceOf(user))
}

async function queryExchangeRate(tokenContract) {
  return await withBackoffRetries(async () => tokenContract.exchangeRateStored())
}

// hardcode exchange rates for now
var rates = {
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': '1000000000000000000', // ETH
  '0x577d296678535e4903d59a4c929b718e1d575e0a': '15405738054265288944', // WBTC
  '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02': '420072999319953', // USDT
  '0x6e894660985207feb7cf89faf048998c71e8ee89': '12449913804491249', // REP
  '0xbf7a7169562078c96f0ec1a8afd6ae50f12e5a99': '281485209795972', // BAT
  '0xddea378a6ddc8afec82c36e9b0078826bf9e68b6': '372925580282399', // ZRX
  '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': '205364954059859', // DAI
  '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b': '50000000000000', // USDC
}

function queryEthBalance(token) {
  var address = token.address.toLowerCase()
  if (Object.keys(rates).includes(address)) return token.balance.mul(rates[address]).div(decimals(token.decimals))
  else return 0
}

getBalances(user).then(prettyPrint).catch(console.error)

// TODO: move utils to a common location

// utils
const MIN_RETRY_DELAY = 1000
const RETRY_BACKOFF_FACTOR = 2
const MAX_RETRY_DELAY = 10000

var withBackoffRetries = async (f, retryCount = 3, jitter = 250) => {
  let nextWaitTime = MIN_RETRY_DELAY
  let i = 0
  while (true) {
    try {
      return await f()
    } catch (error) {
      i++
      if (i >= retryCount) {
        throw error
      }
      await delay(nextWaitTime + Math.floor(Math.random() * jitter))
      nextWaitTime =
        nextWaitTime === 0 ? MIN_RETRY_DELAY : Math.min(MAX_RETRY_DELAY, RETRY_BACKOFF_FACTOR * nextWaitTime)
    }
  }
}

var delay = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function range(stop) {
  var arr = []
  for (var i = 0; i < stop; ++i) {
    arr.push(i)
  }
  return arr
}

function prettyPrint(obj) {
  function recurse(obj) {
    Object.keys(obj).forEach((key) => {
      if (BN.isBigNumber(obj[key])) obj[key] = obj[key].toString()
      else if (typeof obj[key] === 'object') recurse(obj[key])
    })
  }
  recurse(obj)
  console.log(JSON.stringify(obj, '', '  '))
}

function decimals(d) {
  var s = '1'
  for (var i = 0; i < d; ++i) {
    s = `${s}0`
  }
  return s
}
