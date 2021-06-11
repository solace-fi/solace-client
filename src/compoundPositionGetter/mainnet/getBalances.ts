const { ethers, BigNumber, Contract } = require("ethers")
const BN = BigNumber;
const axios = require("axios");
const fs = require("fs");
const { config } = require("dotenv");
config();

var key, provider, tokens, tokenJson;
var user = "0xa0f75491720835b36edc92d06ddc468d201e9b73";

async function getBalances(user) {
  key = process.env.REACT_APP_ALCHEMY_API_KEY;
  provider = new ethers.providers.AlchemyProvider("homestead", key);
  [tokens, tokenJson] = await Promise.all([
    fs.promises.readFile("tokens.json").then(JSON.parse), // TODO: use api
    fs.promises.readFile("../contracts/ICToken.json").then(JSON.parse)
  ]);
  // get ctoken balances
  var contracts = tokens.map(token => new ethers.Contract(token.token.address, tokenJson.abi, provider));
  var balances = await Promise.all(contracts.map(contract => queryBalance(user, contract)));
  var indices = range(tokens.length);
  indices.forEach(i => tokens[i].token.balance = balances[i]);
  balances = tokens.filter(token => token.token.balance.gt(0));
  // get utoken balances
  indices = range(balances.length);
  contracts = balances.map(balance => new ethers.Contract(balance.token.address, tokenJson.abi, provider));
  var exchangeRates = await Promise.all(contracts.map(contract => queryExchangeRate(contract)));
  indices.forEach(i => balances[i].underlying.balance = balances[i].token.balance.mul(exchangeRates[i]).div("1000000000000000000"));
  // get eth balances
  balances.forEach(balance => balance.eth = {'balance': queryEthBalance(balance.underlying)});
  return balances;
}

async function queryBalance(user, tokenContract) {
  return await withBackoffRetries(async () => tokenContract.balanceOf(user));
}

async function queryExchangeRate(tokenContract) {
  return await withBackoffRetries(async () => tokenContract.exchangeRateStored());
}

// hardcode exchange rates for now
var rates = {
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "1000000000000000000",  // ETH
  "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359": "5214879005539865",     // SAI
  "0xc00e94cb662c3520282e6f5717214004a7f26888": "131044789678131649",   // COMP
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "9259278326749300",     // UNI
  "0x514910771af9ca656af840dff83e8264ecf986ca": "9246653217422099",     // LINK
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "15405738054265288944", // WBTC
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "420072999319953",      // USDT
  "0x1985365e9f78359a9b6ad760e32412f4a445e862": "12449913804491249",    // REP
  "0x0d8775f648430679a709e98d2b0cb6250d2887ef": "281485209795972",      // BAT
  "0xe41d2489571d322189246dafa5ebde1f4699f498": "372925580282399",      // ZRX
  "0x0000000000085d4780b73119b644ae5ecd22b376": "419446558886231",      // TUSD
  "0x6b175474e89094c44da98b954eedeac495271d0f": "205364954059859",      // DAI
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "50000000000000"        // USDC
}

function queryEthBalance(token) {
  var address = token.address.toLowerCase();
  if(Object.keys(rates).includes(address)) return token.balance.mul(rates[address]).div(decimals(token.decimals));
  else return 0;
}

getBalances(user)
  .then(prettyPrint)
  .catch(console.error);

// TODO: move utils to a common location

// utils
const MIN_RETRY_DELAY = 1000;
const RETRY_BACKOFF_FACTOR = 2;
const MAX_RETRY_DELAY = 10000;

var withBackoffRetries = async (
  f,
  retryCount = 3,
  jitter = 250
) => {
  let nextWaitTime = MIN_RETRY_DELAY;
  let i = 0;
  while (true) {
    try {
      return await f();
    } catch (error) {
      i++;
      if (i >= retryCount) {
        throw error;
      }
      await delay(nextWaitTime + Math.floor(Math.random()*jitter));
      nextWaitTime =
        nextWaitTime === 0
          ? MIN_RETRY_DELAY
          : Math.min(MAX_RETRY_DELAY, RETRY_BACKOFF_FACTOR * nextWaitTime);
    }
  }
}

var delay = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function range(stop) {
  var arr = [];
  for(var i = 0; i < stop; ++i) {
    arr.push(i);
  }
  return arr;
}

function prettyPrint(obj) {
  function recurse(obj) {
    Object.keys(obj).forEach(key => {
      if(BN.isBigNumber(obj[key])) obj[key] = obj[key].toString();
      else if(typeof obj[key] === 'object') recurse(obj[key]);
    });
  }
  recurse(obj);
  console.log(JSON.stringify(obj, "", "  "));
}

function decimals(d) {
  var s = '1';
  for(var i = 0; i < d; ++i) {
    s = `${s}0`;
  }
  return s;
}
