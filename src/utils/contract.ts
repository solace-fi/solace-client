import { BigNumber, utils, providers } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { rangeFrom0, numberify } from './numeric'
import { equalsIgnoreCase, getContract } from '.'
import { withBackoffRetries } from './time'
import ierc20Alt from '../constants/abi/IERC20MetadataAlt.json'
import { ZERO } from '../constants'
import { ContractCall } from 'ethers-multicall'
import { multicallAddresses } from '@solace-fi/sdk-nightly'
import { all } from 'ethers-multicall/dist/call'

const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const queryBalance = async (tokenContract: Contract, user: string): Promise<BigNumber> => {
  return await withBackoffRetries(async () => tokenContract.balanceOf(user)).catch((e) => {
    console.log('queryBalance', tokenContract.address, 'for', user, e)
    return ZERO
  })
}

export const queryName = async (tokenContract: Contract, provider: any): Promise<string> => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 'Ether'
  try {
    return await withBackoffRetries(async () => tokenContract.name())
  } catch (e) {
    const tokenContractAlt = getContract(tokenContract.address, ierc20Alt.abi, provider)
    return await withBackoffRetries(async () => tokenContractAlt.name()).then(utils.parseBytes32String)
  }
}

export const querySymbol = async (tokenContract: Contract, provider: any): Promise<string> => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 'ETH'
  try {
    return await withBackoffRetries(async () => tokenContract.symbol())
  } catch (e) {
    const tokenContractAlt = getContract(tokenContract.address, ierc20Alt.abi, provider)
    return await withBackoffRetries(async () => tokenContractAlt.symbol()).then(utils.parseBytes32String)
  }
}

export const queryDecimals = async (tokenContract: Contract): Promise<number> => {
  if (equalsIgnoreCase(tokenContract.address, eth)) return 18
  return await withBackoffRetries(async () => tokenContract.decimals().then(numberify)).catch((e) => {
    console.log(`queryDecimals`, tokenContract.address, e)
    return 0
  })
}

export const queryUnderLying = async (tokenContract: Contract): Promise<string> => {
  return await withBackoffRetries(async () => tokenContract.underlying()).catch((e) => {
    console.log(`queryUnderLying`, tokenContract.address, e)
    return 'unreadableUnderlying'
  })
}

export const sortTokens = (tokenA: string, tokenB: string): [string, string] => {
  return BigNumber.from(tokenA).lt(BigNumber.from(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA]
}

export const listTokens = async (contract: Contract): Promise<BigNumber[]> => {
  const supply: BigNumber = await withBackoffRetries(async () => contract.totalSupply())
  const indices = rangeFrom0(supply.toNumber())
  const tokenIds: BigNumber[] = await Promise.all(
    indices.map(async (index: number) => await withBackoffRetries(async () => contract.tokenByIndex(index)))
  ).catch((e) => {
    console.log('error: listTokens', e)
    return []
  })
  return tokenIds
}

export const listTokensOfOwner = async (token: Contract, account: string): Promise<BigNumber[]> => {
  const numTokensOfOwner: BigNumber = await queryBalance(token, account)
  const indices = rangeFrom0(numTokensOfOwner.toNumber())
  const tokenIds: BigNumber[] = await Promise.all(
    indices.map(
      async (index: number) => await withBackoffRetries(async () => token.tokenOfOwnerByIndex(account, index))
    )
  ).catch((e) => {
    console.log('error: listTokensOfOwner', e)
    return []
  })
  return tokenIds
}

export class MulticallProvider {
  _provider: providers.Provider
  _multicallAddress: string

  constructor(provider: providers.Provider, chainId: number) {
    this._provider = provider
    this._multicallAddress = multicallAddresses[chainId]
  }
  public async all<T extends any[] = any[]>(calls: ContractCall[]) {
    if (!this._provider) {
      throw new Error('Provider should be initialized before use.')
    }
    return all<T>(calls, this._multicallAddress, this._provider)
  }
}

export const multicallChunked = async (mcProvider: MulticallProvider, calls: ContractCall[], chunkSize = 25) => {
  // break into chunks
  const chunks: ContractCall[][] = []
  for (let i = 0; i < calls.length; i += chunkSize) {
    const _chunk: ContractCall[] = []
    for (let j = 0; j < chunkSize && i + j < calls.length; ++j) {
      _chunk.push(calls[i + j])
    }
    chunks.push(_chunk)
  }
  // parallel call each chunk
  const res1: any[][] = await Promise.all(chunks.map((chunk) => withBackoffRetries(() => mcProvider.all(chunk))))
  // reassemble
  const res2: any[] = []
  for (let i = 0; i < res1.length; ++i) {
    for (let j = 0; j < res1[i].length; ++j) {
      res2.push(res1[i][j])
    }
  }
  return res2
}
