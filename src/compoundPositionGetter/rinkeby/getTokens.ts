import { ethers, BigNumber, Contract } from 'ethers'

import ctokenJson from '../contracts/ICToken.json'
import ierc20Json from '../contracts/IERC20Metadata.json'
import ierc20altJson from '../contracts/IERC20MetadataAlt.json'

import { equalsIgnoreCase, withBackoffRetries, numberify, range } from '../../utils/positionGetter'

var eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
var cEth = '0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e'

export const getTokens = async (provider: any) => {
  var ctokenAddresses = [
    '0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e',
    '0xEBf1A11532b93a529b5bC942B4bAA98647913002',
    '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
    '0x5B281A6DdA0B271e91ae35DE655Ad301C976edb1',
    '0x2fB298BDbeF468638AD6653FF8376575ea41e768',
    '0x52201ff1720134bBbBB2f6BC97Bf3715490EC19B',
    '0xebe09eb3411d18f4ff8d859e096c533cac5c6b60',
    '0x0014f450b8ae7708593f4a46f8fa6e5d50620f96',
  ]
  // get ctoken contracts
  var ctokenContracts = ctokenAddresses.map((address) => new ethers.Contract(address, ctokenJson.abi, provider))
  // get underlying
  var utokenAddresses = await Promise.all(ctokenContracts.map((contract: any) => queryUnderLying(contract)))
  // get utoken contracts
  var utokenContracts = utokenAddresses.map((address) => new ethers.Contract(address, ierc20Json.abi, provider))
  // get metadata
  var [ctokenNames, ctokenSymbols, ctokenDecimals, utokenNames, utokenSymbols, utokenDecimals] = await Promise.all([
    Promise.all(ctokenContracts.map((contract: any) => queryTokenName(contract, provider))),
    Promise.all(ctokenContracts.map((contract: any) => queryTokenSymbol(contract, provider))),
    Promise.all(ctokenContracts.map(queryTokenDecimals)),
    Promise.all(utokenContracts.map((contract: any) => queryTokenName(contract, provider))),
    Promise.all(utokenContracts.map((contract: any) => queryTokenSymbol(contract, provider))),
    Promise.all(utokenContracts.map(queryTokenDecimals)),
  ])
  // assemble results
  var indices = range(ctokenAddresses.length)
  var tokens = indices.map((i) => {
    return {
      token: {
        address: ctokenAddresses[i],
        name: ctokenNames[i],
        symbol: ctokenSymbols[i],
        decimals: ctokenDecimals[i],
      },
      underlying: {
        address: utokenAddresses[i],
        name: utokenNames[i],
        symbol: utokenSymbols[i],
        decimals: utokenDecimals[i],
      },
    }
  })
  return tokens
}

const queryUnderLying = async (ctokenContract: any) => {
  if (equalsIgnoreCase(ctokenContract.address, cEth)) return eth
  return await withBackoffRetries(async () => ctokenContract.underlying())
}

const queryTokenName = async (tokenContract: any, provider: any) => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 'Ether'
  try {
    return await withBackoffRetries(async () => tokenContract.name())
  } catch (e) {
    var tokenContractAlt = new ethers.Contract(tokenContract.address, ierc20altJson.abi, provider)
    return await withBackoffRetries(async () => tokenContractAlt.name().then(ethers.utils.parseBytes32String))
  }
}

const queryTokenSymbol = async (tokenContract: any, provider: any) => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 'ETH'
  try {
    return await withBackoffRetries(async () => tokenContract.symbol())
  } catch (e) {
    var tokenContractAlt = new ethers.Contract(tokenContract.address, ierc20altJson.abi, provider)
    return await withBackoffRetries(async () => tokenContractAlt.symbol().then(ethers.utils.parseBytes32String))
  }
}

const queryTokenDecimals = async (tokenContract: any) => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 18
  return await withBackoffRetries(async () => tokenContract.decimals().then(numberify))
}
