import { NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances, getProductTokenBalances } from '../../getBalances'
import { accurateMultiply, getNonHumanValue } from '../../../utils/formatting'
import ierc20Json from '../../../constants/metadata/IERC20Metadata.json'
import { vaultAbi } from './_contracts/yearnAbis'
import { equalsIgnoreCase, getContract } from '../../../utils'

import { BigNumber } from 'ethers'
import { ZERO } from '../../../constants'

import curveRegistryAbi from '../../curve/positionGetter/_contracts/ICurveRegistry.json'
import curveAddressProviderAbi from '../../curve/positionGetter/_contracts/ICurveAddressProvider.json'
import curvePoolAbi from '../../curve/positionGetter/_contracts/ICurvePool.json'
import { queryDecimals } from '../../../utils/contract'
import { get1InchPrice, getCoingeckoTokenPrice, getZapperProtocolBalances } from '../../../utils/api'
import { WETH9_ADDRESS } from '../../../constants/mappings/tokenAddressMapping'
import { createZapperBalanceMap, networkNames } from '../../zapperBalances'

const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  // const balances: Token[] = await getProductTokenBalances(user, ierc20Json.abi, tokens, provider)

  const zapperNet = networkNames[activeNetwork.chainId]
  if (!zapperNet) return []

  const coinGeckoEthPrice = await getCoingeckoTokenPrice(WETH9_ADDRESS[activeNetwork.chainId], 'usd', 'ethereum')
  const data = await getZapperProtocolBalances('yearn', [user], zapperNet)

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

  // get utoken balances
  // const indices = rangeFrom0(balances.length)
  // const vaultContracts = balances.map((balance) => new Contract(balance.token.address, vaultAbi, provider))
  // const [pricesPerShare, decimals] = await Promise.all([
  //   Promise.all(vaultContracts.map((contract: any) => contract.pricePerShare())),
  //   Promise.all(vaultContracts.map(queryDecimals)),
  // ])

  // indices.forEach((i) => {
  //   balances[i].underlying[0].balance = balances[i].token.balance
  //     .mul(pricesPerShare[i])
  //     .div(String(getNonHumanValue(1, decimals[i])))
  // })

  // const curveAddressProviderContract = getContract(CURVE_ADDRRESS_PROVIDER_ADDR, curveAddressProviderAbi.abi, provider)

  // const registryAddr = await curveAddressProviderContract.get_registry()
  // const curveRegistryContract = getContract(registryAddr, curveRegistryAbi, provider)

  // for (let i = 0; i < balances.length; i++) {
  //   if (balances[i].token.symbol.startsWith('yvCurve')) {
  //     const curvePoolAddr = await curveRegistryContract.get_pool_from_lp_token(balances[i].underlying[0].address)
  //     const poolContract = getContract(curvePoolAddr, curvePoolAbi, provider)

  //     const uBalance = await poolContract.calc_withdraw_one_coin(balances[i].underlying[0].balance, 0)

  //     const underlyingTokens = await curveRegistryContract.get_underlying_coins(curvePoolAddr)

  //     try {
  //       const res = await get1InchPrice(underlyingTokens[0], ETH, uBalance.toString())
  //       const ethAmount: BigNumber = BigNumber.from(res.data.toTokenAmount)
  //       balances[i].eth.balance = ethAmount
  //     } catch (e) {
  //       console.log(e)
  //     }
  //   } else {
  //     balances[i].eth.balance = await getNativeTokenBalance(balances[i].underlying[0].address, balances[i])
  //   }
  // }
  // return balances
}

// const getNativeTokenBalance = async (underlyingAddress: string, token: Token): Promise<BigNumber> => {
//   if (!equalsIgnoreCase(underlyingAddress, ETH)) {
//     try {
//       const res = await get1InchPrice(
//         underlyingAddress,
//         ETH,
//         token.underlying[0].balance
//           .div(String(getNonHumanValue(1, token.token.decimals - token.underlying[0].decimals)))
//           .toString()
//       )
//       const ethAmount: BigNumber = BigNumber.from(res.data.toTokenAmount)
//       return ethAmount
//     } catch (e) {
//       console.log(e)
//       return ZERO
//     }
//   } else {
//     return token.underlying[0].balance
//   }
// }
