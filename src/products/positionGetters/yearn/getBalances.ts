import { NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances, getProductTokenBalances } from '../getBalances'
import { getNonHumanValue } from '../../../utils/formatting'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { vaultAbi } from './_contracts/yearnAbis'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  const balances: Token[] = await getProductTokenBalances(user, ierc20Json.abi, tokens, provider)

  // get utoken balances
  const indices = rangeFrom0(balances.length)
  const vaultContracts = balances.map((balance) => new Contract(balance.token.address, vaultAbi, provider))
  const [pricesPerShare, decimals] = await Promise.all([
    Promise.all(vaultContracts.map((contract: any) => contract.pricePerShare())),
    Promise.all(vaultContracts.map((contract: any) => contract.decimals())),
  ])

  indices.forEach(
    (i) =>
      (balances[i].underlying[0].balance = balances[i].token.balance
        .mul(pricesPerShare[i])
        .div(String(getNonHumanValue(1, decimals[i]))))
  )

  // get native token balances
  const tokenBalances = await addNativeTokenBalances(balances, indices, activeNetwork.chainId)
  return tokenBalances
}
