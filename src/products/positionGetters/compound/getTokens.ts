import { utils } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { ZERO } from '../../../constants'
import ctokenJson from './contracts/ICToken.json'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import ierc20altJson from './contracts/IERC20MetadataAlt.json'
import { NetworkConfig, Token } from '../../../constants/types'
import { equalsIgnoreCase } from '../../../utils'
import { withBackoffRetries } from '../../../utils/time'
import { numberify, rangeFrom0 } from '../../../utils/numeric'
import comptrollerJson from './contracts/IComptroller.json'

const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
let cEth = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig): Promise<Token[]> => {
  let ctokenAddresses: string[] = []
  if (activeNetwork.chainId == 4) {
    cEth = '0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e'
    ctokenAddresses = [
      '0xd6801a1DfFCd0a410336Ef88DeF4320D6DF1883e',
      '0xEBf1A11532b93a529b5bC942B4bAA98647913002',
      '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
      '0x5B281A6DdA0B271e91ae35DE655Ad301C976edb1',
      '0x2fB298BDbeF468638AD6653FF8376575ea41e768',
      '0x52201ff1720134bBbBB2f6BC97Bf3715490EC19B',
      '0xebe09eb3411d18f4ff8d859e096c533cac5c6b60',
      '0x0014f450b8ae7708593f4a46f8fa6e5d50620f96',
    ]
  } else if (activeNetwork.chainId == 1) {
    const comptrollerContract = new Contract(
      '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
      comptrollerJson.abi,
      provider
    )
    ctokenAddresses = await withBackoffRetries(async () => comptrollerContract.getAllMarkets())
  }

  const ctokenContracts = ctokenAddresses.map((address: string) => new Contract(address, ctokenJson.abi, provider))
  // get underlying
  const utokenAddresses = await Promise.all(ctokenContracts.map((contract: any) => queryUnderLying(contract)))
  // get utoken contracts
  const utokenContracts = utokenAddresses.map((address: any) => new Contract(address, ierc20Json.abi, provider))
  // get metadata
  const [ctokenNames, ctokenSymbols, ctokenDecimals, utokenNames, utokenSymbols, utokenDecimals] = await Promise.all([
    Promise.all(ctokenContracts.map((contract: any) => queryTokenName(contract, provider))),
    Promise.all(ctokenContracts.map((contract: any) => queryTokenSymbol(contract, provider))),
    Promise.all(ctokenContracts.map(queryTokenDecimals)),
    Promise.all(utokenContracts.map((contract: any) => queryTokenName(contract, provider))),
    Promise.all(utokenContracts.map((contract: any) => queryTokenSymbol(contract, provider))),
    Promise.all(utokenContracts.map(queryTokenDecimals)),
  ])
  // assemble results
  const indices = rangeFrom0(ctokenAddresses.length)
  const tokens = indices.map((i) => {
    return {
      token: {
        address: ctokenAddresses[i],
        name: ctokenNames[i],
        symbol: ctokenSymbols[i],
        decimals: ctokenDecimals[i],
        balance: ZERO,
      },
      underlying: {
        address: utokenAddresses[i],
        name: utokenNames[i],
        symbol: utokenSymbols[i],
        decimals: utokenDecimals[i],
        balance: ZERO,
      },
      eth: {
        balance: ZERO,
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
    const tokenContractAlt = new Contract(tokenContract.address, ierc20altJson.abi, provider)
    return await withBackoffRetries(async () => tokenContractAlt.name().then(utils.parseBytes32String))
  }
}

const queryTokenSymbol = async (tokenContract: any, provider: any) => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 'ETH'
  try {
    return await withBackoffRetries(async () => tokenContract.symbol())
  } catch (e) {
    const tokenContractAlt = new Contract(tokenContract.address, ierc20altJson.abi, provider)
    return await withBackoffRetries(async () => tokenContractAlt.symbol().then(utils.parseBytes32String))
  }
}

const queryTokenDecimals = async (tokenContract: any) => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 18
  return await withBackoffRetries(async () => tokenContract.decimals().then(numberify))
}
