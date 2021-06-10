const { ethers, BigNumber, Contract } = require("ethers")
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
  var balances = await Promise.all(tokens.map(token => queryBalance(user, token.token.address)));
  var indices = range(tokens.length);
  indices.forEach(i => tokens[i].token.balance = balances[i]);
  balances = tokens.filter(token => token.token.balance.gt(0));
  return balances;
}

async function queryBalance(user, contractAddress) {
  var contract = new ethers.Contract(contractAddress, tokenJson.abi, provider);
  return await withBackoffRetries(async () => contract.balanceOf(user));
}

getBalances(user)
  .then(console.log)
  .catch(console.error);

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
