import tokenJson from '../contracts/ICToken.json'
import { rangeFrom0 } from '../../../numeric'
import { Token } from '../../../../constants/types'
import { addNativeTokenBalances, getProductTokenBalances } from '../../getBalances'
import { addExchangeRates } from '../addExchangeRates'
import { policyConfig } from '../../../config/chainConfig'
import { ProductName } from '../../../../constants/enums'

export const getBalances = async (user: string, provider: any, chainId: number): Promise<Token[]> => {
  // get ctoken balances
  const savedTokens = policyConfig[String(chainId)].tokens[ProductName.COMPOUND].savedTokens
  const balances: Token[] = await getProductTokenBalances(user, tokenJson.abi, savedTokens, provider)

  // get utoken balances
  const indices = rangeFrom0(balances.length)
  const balancesWithRates = await addExchangeRates(balances, indices, tokenJson.abi, provider)

  // get native token balances
  const tokenBalances = await addNativeTokenBalances(balancesWithRates, indices, chainId)
  return tokenBalances
}
