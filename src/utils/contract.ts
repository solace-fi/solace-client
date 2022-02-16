import { BigNumber, utils } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { rangeFrom0, numberify } from './numeric'
import { equalsIgnoreCase, getContract } from '.'
import { withBackoffRetries } from './time'
import ierc20Alt from '../constants/metadata/IERC20MetadataAlt.json'
import { ZERO } from '../constants'

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
  const supply: BigNumber = await contract.totalSupply()
  const indices = rangeFrom0(supply.toNumber())
  const tokenIds: BigNumber[] = await Promise.all(
    indices.map(async (index: number) => await contract.tokenByIndex(index))
  )
  return tokenIds
}

export const listTokensOfOwner = async (token: Contract, account: string): Promise<BigNumber[]> => {
  const numTokensOfOwner: BigNumber = await queryBalance(token, account)
  const indices = rangeFrom0(numTokensOfOwner.toNumber())
  const tokenIds: BigNumber[] = await Promise.all(
    indices.map(async (index: number) => await token.tokenOfOwnerByIndex(account, index))
  )
  return tokenIds
}
