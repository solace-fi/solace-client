const { ethers, BigNumber, Contract } = require("ethers")
const axios = require("axios");
const fs = require("fs");
const { config } = require("dotenv");
config();

var key, provider, comptrollerJson, comptrollerContract, ctokenJson, ierc20Json, ierc20altJson;
var eth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
var cEth = "0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e";
(async () => { })()

async function getTokens() {
  // get key
  key = process.env.REACT_APP_ALCHEMY_API_KEY;
  provider = new ethers.providers.AlchemyProvider("rinkeby", key);
  // get contract abis
  [comptrollerJson, ctokenJson, ierc20Json, ierc20altJson] = await Promise.all([
    fs.promises.readFile("../contracts/IComptroller.json").then(JSON.parse),
    fs.promises.readFile("../contracts/ICToken.json").then(JSON.parse),
    fs.promises.readFile("../contracts/IERC20Metadata.json").then(JSON.parse),
    fs.promises.readFile("../contracts/IERC20MetadataAlt.json").then(JSON.parse)
  ]);
  // get comptroller
  comptrollerContract = new ethers.Contract("0x2EAa9D77AE4D8f9cdD9FAAcd44016E746485bddb", comptrollerJson.abi, provider);
  // get ctoken addresses
  //var ctokenAddresses = await withBackoffRetries(async () => comptrollerContract.getAllMarkets()); // method doesn't exist on rinkeby implementation
  var ctokenAddresses = ["0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e", "0xEBf1A11532b93a529b5bC942B4bAA98647913002", "0x6D7F0754FFeb405d23C51CE938289d4835bE3b14", "0x5B281A6DdA0B271e91ae35DE655Ad301C976edb1", "0x2fB298BDbeF468638AD6653FF8376575ea41e768", "0x52201ff1720134bBbBB2f6BC97Bf3715490EC19B", "0xebe09eb3411d18f4ff8d859e096c533cac5c6b60", "0x0014f450b8ae7708593f4a46f8fa6e5d50620f96"];
  // get ctoken contracts
  var ctokenContracts = ctokenAddresses.map(address => new ethers.Contract(address, ctokenJson.abi, provider));
  // get underlying
  var utokenAddresses = await Promise.all(ctokenContracts.map(queryUnderlying));
  // get utoken contracts
  var utokenContracts = utokenAddresses.map(address => new ethers.Contract(address, ierc20Json.abi, provider));
  // get metadata
  var [ctokenNames, ctokenSymbols, ctokenDecimals, utokenNames, utokenSymbols, utokenDecimals] = await Promise.all([
    Promise.all(ctokenContracts.map(queryTokenName)),
    Promise.all(ctokenContracts.map(queryTokenSymbol)),
    Promise.all(ctokenContracts.map(queryTokenDecimals)),
    Promise.all(utokenContracts.map(queryTokenName)),
    Promise.all(utokenContracts.map(queryTokenSymbol)),
    Promise.all(utokenContracts.map(queryTokenDecimals))
  ]);
  // assemble results
  var indices = range(ctokenAddresses.length);
  var tokens = indices.map(i => {
    return {
      "token": {
        "address": ctokenAddresses[i],
        "name": ctokenNames[i],
        "symbol": ctokenSymbols[i],
        "decimals": ctokenDecimals[i]
      },
      "underlying": {
        "address": utokenAddresses[i],
        "name": utokenNames[i],
        "symbol": utokenSymbols[i],
        "decimals": utokenDecimals[i]
      }
    }
  });
  return tokens;
}

async function queryUnderlying(ctokenContract) {
  if(ctokenContract.address.equalsIgnoreCase(cEth)) return eth;
  return await withBackoffRetries(async () => ctokenContract.underlying());
}

async function queryTokenName(tokenContract) {
  if(tokenContract.address.equalsIgnoreCase(eth)) return "Ether";
  try {
    return await withBackoffRetries(async () => tokenContract.name());
  } catch (e) {
    var tokenContractAlt = new ethers.Contract(tokenContract.address, ierc20altJson.abi, provider);
    return await withBackoffRetries(async () => tokenContractAlt.name().then(ethers.utils.parseBytes32String));
  }
}

async function queryTokenSymbol(tokenContract) {
  if(tokenContract.address.equalsIgnoreCase(eth)) return "ETH";
  try {
    return await withBackoffRetries(async () => tokenContract.symbol());
  } catch (e) {
    var tokenContractAlt = new ethers.Contract(tokenContract.address, ierc20altJson.abi, provider);
    return await withBackoffRetries(async () => tokenContractAlt.symbol().then(ethers.utils.parseBytes32String));
  }
}

async function queryTokenDecimals(tokenContract) {
  if(tokenContract.address.equalsIgnoreCase(eth)) return 18;
  return await withBackoffRetries(async () => tokenContract.decimals().then(numberify));
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

String.prototype.equalsIgnoreCase = function (compareString) { return this.toUpperCase() === compareString.toUpperCase(); };

function numberify(number) {
  if(typeof(number) == 'number') return number;
  if(typeof(number) == 'string') return number-0;
  return number.toNumber() // hopefully bignumber
}
