import { Contract } from '@ethersproject/contracts'
import { Token } from '../../../constants/types'
import { POW_EIGHTEEN } from '../../../constants'
import { withBackoffRetries } from '../..'

export const addExchangeRates = async (
  balances: Token[],
  indices: number[],
  abi: any,
  provider: any
): Promise<Token[]> => {
  const contracts = balances.map((balance) => new Contract(balance.token.address, abi, provider))
  const exchangeRates = await Promise.all(contracts.map((contract) => queryExchangeRate(contract)))
  indices.forEach(
    (i) => (balances[i].underlying.balance = balances[i].token.balance.mul(exchangeRates[i]).div(String(POW_EIGHTEEN)))
  )
  return balances
}

const queryExchangeRate = async (tokenContract: Contract) => {
  return await withBackoffRetries(async () => tokenContract.exchangeRateStored())
}
