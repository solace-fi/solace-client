const { ethers, BigNumber, Contract } = require("ethers")
const axios = require("axios");
const fs = require("fs");
const { config } = require("dotenv");
config();

var key, provider, addressProviderJson, addressProviderContract, registryJson, registryContract, poolJson, poolContract, tokenJson, tokenContract;

async function getTokens() {
  // get key
  key = process.env.REACT_APP_ALCHEMY_API_KEY;
  provider = new ethers.providers.AlchemyProvider("homestead", key);
  // get contract abis
  [addressProviderJson, registryJson, poolJson, tokenJson] = await Promise.all([
    fs.promises.readFile("contracts/ICurveAddressProvider.json").then(JSON.parse),
    fs.promises.readFile("contracts/ICurveRegistry.json").then(JSON.parse),
    fs.promises.readFile("contracts/ICurvePool.json").then(JSON.parse),
    fs.promises.readFile("contracts/ICurveToken.json").then(JSON.parse)
  ]);
  // get address provider
  addressProviderContract = new ethers.Contract("0x0000000022D53366457F9d5E68Ec105046FC4383", addressProviderJson.abi, provider);
  // get registry
  var registryAddress = await withBackoffRetries(async () => addressProviderContract.get_registry());
  registryContract = new ethers.Contract(registryAddress, registryJson.abi, provider);
  // get pool count
  var length = await withBackoffRetries(async () => registryContract.pool_count());
  var indices = range(length.toNumber());
  // get pool addresses
  var poolAddresses = await Promise.all(indices.map(queryPoolAddress));
  // get token addresses
  var tokenAddresses = await Promise.all(poolAddresses.map(queryPoolToken));
  // get token contracts
  var tokenContracts = tokenAddresses.map(address => new ethers.Contract(address, tokenJson.abi, provider));
  // get more pool and token data
  var [poolNames, tokenNames, tokenSymbols, tokenDecimals] = await Promise.all([
    Promise.all(poolAddresses.map(queryPoolName)),
    Promise.all(tokenContracts.map(queryTokenName)),
    Promise.all(tokenContracts.map(queryTokenSymbol)),
    Promise.all(tokenContracts.map(queryTokenDecimals))
  ]);
  // assemble results
  var tokens = indices.map(i => {
    return {
      "pool": {
        "address": poolAddresses[i],
        "name": poolNames[i]
      },
      "token": {
        "address": tokenAddresses[i],
        "name": tokenNames[i],
        "symbol": tokenSymbols[i],
        "decimals": tokenDecimals[i]
      }
    }
  });
  return tokens;
}

async function queryPoolAddress(index) {
  return await withBackoffRetries(async () => registryContract.pool_list(index));
}

async function queryPoolName(address) {
  return await withBackoffRetries(async () => registryContract.get_pool_name(address));
}

async function queryPoolToken(address) {
  return await withBackoffRetries(async () => registryContract.get_lp_token(address));
}

async function queryTokenName(tokenContract) {
  return await withBackoffRetries(async () => tokenContract.name());
}

async function queryTokenSymbol(tokenContract) {
  return await withBackoffRetries(async () => tokenContract.symbol());
}

async function queryTokenDecimals(tokenContract) {
  return await withBackoffRetries(async () => tokenContract.decimals().then(res=>res.toNumber()));
}

getTokens()
  .then(tokens => {
    console.log(tokens);
    fs.writeFileSync('tokens.json', JSON.stringify(tokens));
  })
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
