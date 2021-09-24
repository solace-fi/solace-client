import { Token } from '../../constants/types'
import { Contract } from '@ethersproject/contracts'
import { equalsIgnoreCase } from '../../utils'
import { withBackoffRetries } from '../../utils/time'
import { rangeFrom0, bnCmp } from '../../utils/numeric'
import { BigNumber } from 'ethers'
import axios from 'axios'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getProductTokenBalances = async (
  user: string,
  abi: any,
  tokens: Token[],
  provider: any
): Promise<Token[]> => {
  if (tokens.length == 0) return []
  const contracts = tokens.map((token) => new Contract(token.token.address, abi, provider))
  const queriedBalances = await Promise.all(contracts.map((contract) => queryBalance(user, contract)))
  const indices = rangeFrom0(tokens.length)
  indices.forEach((i) => (tokens[i].token.balance = queriedBalances[i]))
  const balances: Token[] = tokens.filter((token) => token.token.balance.gt(0))
  return balances
}

export const addNativeTokenBalances = async (
  balances: Token[],
  indices: number[],
  chainId: number,
  getMainNetworkTokenAddress?: (address: string, chainId: number) => string
): Promise<Token[]> => {
  const ethAmounts = await Promise.all(
    balances.map((balance) => queryNativeTokenBalance(balance.underlying, chainId, getMainNetworkTokenAddress))
  )
  indices.forEach((i) => (balances[i].eth.balance = ethAmounts[i]))
  if (balances.length > 1) balances.sort((balanceA, balanceB) => bnCmp(balanceA.eth.balance, balanceB.eth.balance))
  return balances
}

const queryBalance = async (user: string, tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.balanceOf(user))
}

export const queryNativeTokenBalance = async (
  token: any,
  chainId: number,
  getMainNetworkTokenAddress?: (address: string, chainId: number) => string
): Promise<BigNumber> => {
  if (equalsIgnoreCase(token.address, ETH)) return BigNumber.from(token.balance)
  let address = token.address
  if (getMainNetworkTokenAddress) {
    address = getMainNetworkTokenAddress(token.address, chainId)
  }
  const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${address}&toTokenAddress=${ETH}&amount=${token.balance.toString()}`
  const res = await withBackoffRetries(async () => axios.get(url))
  return BigNumber.from(res.data.toTokenAmount)
}
