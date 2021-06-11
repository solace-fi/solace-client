import { ethers, BigNumber, Contract } from 'ethers'

import comptrollerJson from '../contracts/IComptroller.json'
import ctokenJson from '../contracts/ICToken.json'
import ierc20Json from '../contracts/IERC20Metadata.json'
import ierc20altJson from '../contracts/IERC20MetadataAlt.json'

import { equalsIgnoreCase } from '../../utils/positionGetter'

var eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
var cEth = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'

export const getTokens = async (provider: any) => {
  const comptrollerContract = new ethers.Contract(
    '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
    comptrollerJson.abi,
    provider
  )

  var ctokenAddresses = await withBackoffRetries(async () => comptrollerContract.getAllMarkets())

  // get ctoken contracts
  var ctokenContracts = ctokenAddresses.map((address: string) => new ethers.Contract(address, ctokenJson.abi, provider))
  // get underlying
  var utokenAddresses = await Promise.all(ctokenContracts.map((contract: any) => queryUnderlying(contract)))
  // get utoken contracts
  var utokenContracts = utokenAddresses.map((address: any) => new ethers.Contract(address, ierc20Json.abi, provider))
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
