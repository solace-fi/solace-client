import { Token } from '../../constants/types'
import { Contract } from '@ethersproject/contracts'
import { rangeFrom0, withBackoffRetries, equalsIgnoreCase, bnCmp } from '..'
import { BigNumber } from 'ethers'
import axios from 'axios'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getProductTokenBalances = async (
  user: string,
  abi: any,
  getTokensFunc: (provider: any) => Promise<Token[]>,
  provider: any
): Promise<Token[]> => {
  const tokens = await getTokensFunc(provider)
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
  getMainNetworkToken?: (address: string, chainId: number) => string
): Promise<Token[]> => {
  const ethAmounts = await Promise.all(
    balances.map((balance) => queryNativeTokenBalance(balance.underlying, chainId, getMainNetworkToken))
  )
  indices.forEach((i) => (balances[i].eth.balance = ethAmounts[i]))
  balances.sort((balanceA, balanceB) => bnCmp(balanceA.eth.balance, balanceB.eth.balance))
  return balances
}

const queryBalance = async (user: string, tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.balanceOf(user))
}

const queryNativeTokenBalance = async (
  token: any,
  chainId: number,
  getMainNetworkToken?: (address: string, chainId: number) => string
) => {
  if (equalsIgnoreCase(token.address, ETH)) return BigNumber.from(token.balance)
  let address = token.address
  if (getMainNetworkToken) {
    address = getMainNetworkToken(token.address, chainId)
  }
  const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${address}&toTokenAddress=${ETH}&amount=${token.balance.toString()}`
  const res = await withBackoffRetries(async () => axios.get(url))
  return BigNumber.from(res.data.toTokenAmount)
}
