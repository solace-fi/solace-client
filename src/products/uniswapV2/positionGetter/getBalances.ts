import { NetworkConfig, Token } from '../../../constants/types'
import { getProductTokenBalances, queryNativeTokenBalance } from '../../getBalances'
import ierc20Json from '../../../constants/metadata/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { queryBalance } from '../../../utils/contract'
import { ZERO } from '../../../constants'
import { get1InchPrice, getCoingeckoTokenPriceByAddr, getZapperProtocolBalances } from '../../../utils/api'
import { createZapperBalanceMap, networkNames } from '../../zapperBalances'
import { WETH9_ADDRESS } from '../../../constants/mappings/tokenAddressMapping'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  // const balances: Token[] = await getProductTokenBalances(user, ierc20Json.abi, tokens, provider)

  // for (let i = 0; i < balances.length; i++) {
  //   const token0Contract = getContract(balances[i].underlying[0].address, ierc20Json.abi, provider)
  //   const token1Contract = getContract(balances[i].underlying[1].address, ierc20Json.abi, provider)

  //   const bal0 = await queryBalance(token0Contract, balances[i].token.address)
  //   const bal1 = await queryBalance(token1Contract, balances[i].token.address)

  //   const lpTokenContract = getContract(balances[i].token.address, ierc20Json.abi, provider)

  //   const totalSupply = await lpTokenContract.totalSupply()
  //   const liquidity = await queryBalance(lpTokenContract, balances[i].token.address)

  //   const adjustedLiquidity = liquidity.add(balances[i].token.balance)

  //   const amount0 = adjustedLiquidity.mul(bal0).div(totalSupply)
  //   const amount1 = adjustedLiquidity.mul(bal1).div(totalSupply)

  //   balances[i].underlying[0].balance = amount0
  //   balances[i].underlying[1].balance = amount1

  //   let standingEthAmount = ZERO
  //   for (let j = 0; j < balances[i].underlying.length; j++) {
  //     const fetchedAmount = await queryNativeTokenBalance(balances[i].underlying[j], activeNetwork.chainId)
  //     standingEthAmount = standingEthAmount.add(fetchedAmount)
  //   }
  //   balances[i].eth.balance = standingEthAmount
  // }
  // return balances

  const zapperNet = networkNames[activeNetwork.chainId]
  if (!zapperNet) return []

  const coinGeckoEthPrice = await getCoingeckoTokenPriceByAddr(WETH9_ADDRESS[activeNetwork.chainId], 'usd', 'ethereum')
  const data = await getZapperProtocolBalances('uniswap-v2', [user], zapperNet)

  const finalTokens: Token[] = []

  if (!coinGeckoEthPrice) return []
  const tokenMap = createZapperBalanceMap(
    data,
    user,
    parseFloat(coinGeckoEthPrice),
    activeNetwork.nativeCurrency.decimals,
    tokens
  )
  tokenMap.forEach((value: Token) => {
    finalTokens.push(value)
  })
  return finalTokens
}
