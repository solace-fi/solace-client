import { NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances, getProductTokenBalances, queryNativeTokenBalance } from '../../getBalances'
import { getNonHumanValue } from '../../../utils/formatting'
import ierc20Json from '../../_contracts/IERC20Metadata.json'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import axios from 'axios'
import { equalsIgnoreCase, getContract } from '../../../utils'

import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
import curveGaugeAbi from './_contracts/ICurveGauge.json'
import curveRegistryAbi from './_contracts/ICurveRegistry.json'
import curvePoolAbi from './_contracts/ICurvePool.json'
import { ADDRESS_ZERO, ZERO } from '../../../constants'
import { queryBalance } from '../../../utils/contract'
import { getAmounts_CurveGauge } from './getStakes/CurveGauge'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  const balances = tokens
  const indices = rangeFrom0(balances.length)

  // const curveAddressProviderContract = getContract(CURVE_ADDRRESS_PROVIDER_ADDR, curveAddressProviderAbi.abi, provider)
  // const curveRegistryAddress = await curveAddressProviderContract.get_registry()
  // const curveRegistryContract = getContract(curveRegistryAddress, curveRegistryAbi, provider)

  /*

    farm contract segment

  */

  const additionalTokenBalances: BigNumber[] = []
  indices.forEach((i) => (additionalTokenBalances[i] = ZERO))

  const farmAmounts: BigNumber[][] = await Promise.all([getAmounts_CurveGauge(user, provider, activeNetwork, balances)])

  for (let i = 0; i < balances.length; i++) {
    let newBalance = ZERO
    for (let j = 0; j < farmAmounts.length; j++) {
      const a = farmAmounts[j][i]
      newBalance = a.add(newBalance)
    }
    additionalTokenBalances[i] = newBalance
  }

  // for (let i = 0; i < farmAmounts.length; i++) {
  //   let newBalance = ZERO
  //   for (let j = 0; j < farmAmounts[i].length; j++) {
  //     const a = farmAmounts[i][j]
  //     newBalance = a.add(newBalance)
  //   }
  //   additionalTokenBalances[j] = newBalance
  // }

  for (let i = 0; i < balances.length; i++) {
    // const poolAddr = await curveRegistryContract.get_pool_from_lp_token(balances[i].token.address)
    // console.log(balances[i].token.address, 'pool addr', poolAddr)

    const lpTokenContract = getContract(balances[i].token.address, ierc20Json.abi, provider)
    const queriedBalance = await queryBalance(lpTokenContract, user)

    balances[i].token.balance = queriedBalance.add(additionalTokenBalances[i])

    if (balances[i].token.balance.gt(ZERO)) {
      const poolContract = getContract(balances[i].metadata.poolAddr, curvePoolAbi, provider)
      const uBalance = await poolContract.calc_withdraw_one_coin(balances[i].token.balance, 0).catch((e: any) => {
        console.log('getBalances calc_withdraw_one_coin failed', e)
        return ZERO
      })
      balances[i].underlying[0].balance = uBalance

      if (!equalsIgnoreCase(balances[i].underlying[0].address, ETH)) {
        const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${balances[i].underlying[0].address}&toTokenAddress=${ETH}&amount=${balances[i].underlying[0].balance}`
        try {
          const res = await withBackoffRetries(async () => axios.get(url))
          const ethAmount: BigNumber = BigNumber.from(res.data.toTokenAmount)
          balances[i].eth.balance = ethAmount
        } catch (e) {
          console.log(e)
        }
      } else {
        balances[i].eth.balance = balances[i].underlying[0].balance
      }
    }
  }

  return balances.filter((b) => b.token.balance.gt(ZERO))
}
