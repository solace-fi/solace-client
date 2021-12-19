import { NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
// import { Contract } from '@ethersproject/contracts'
// import { addNativeTokenBalances, getProductTokenBalances, queryNativeTokenBalance } from '../../getBalances'
// import { getNonHumanValue } from '../../../utils/formatting'
import ierc20Json from '../../../constants/metadata/IERC20Metadata.json'
import { BigNumber } from 'ethers'
// import { withBackoffRetries } from '../../../utils/time'
// import axios from 'axios'
import { equalsIgnoreCase, getContract } from '../../../utils'

// import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
// import curveGaugeAbi from './_contracts/ICurveGauge.json'
// import curveRegistryAbi from './_contracts/ICurveRegistry.json'
import curvePoolAbi from './_contracts/ICurvePool.json'
import curvePoolAltAbi from './_contracts/ICurvePoolAlt.json'
import curveFactoryPoolAbi from './_contracts/ICurveFactoryPool.json'
import { /*ADDRESS_ZERO,*/ ZERO } from '../../../constants'
import { queryBalance } from '../../../utils/contract'
import { getAmounts_CurveGauge } from './getStakes/CurveGauge'
import { get1InchPrice } from '../../../utils/api'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'

const v1Pools = [
  '0x79a8c46dea5ada233abaffd40f3a0a2b1e5a4f27', // busd
  '0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56', // compound
  '0x06364f10b501e868329afbc005b3492902d6c763', // pax
  '0xa5407eae9ba41422680e2e00537571bcc53efbfd', // susd
  '0x52ea46506b9cc5ef470c5bf89f17dc28bb35d85c', // usdt
  '0x45f783cce6b7ff23b2ab2d70e416cdb7d6055f51', // y
]

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

  const queriedBalances = await Promise.all(
    balances.map((b) => queryBalance(getContract(b.token.address, ierc20Json.abi, provider), user))
  )

  indices.forEach((i) => (balances[i].token.balance = queriedBalances[i].add(additionalTokenBalances[i])))

  const uBalances = await Promise.all(
    balances.map(async (b) => {
      if (b.token.balance.gt(ZERO)) {
        const poolContract = getContract(b.metadata.poolAddr, curvePoolAbi, provider)
        const factoryPoolContract = getContract(b.metadata.poolAddr, curveFactoryPoolAbi, provider)
        if (v1Pools.includes(poolContract.address)) {
          return b.token.balance
        } else {
          const uBalance = b.metadata.isFactory
            ? await factoryPoolContract.calc_withdraw_one_coin(b.token.balance, 0)
            : await poolContract.calc_withdraw_one_coin(b.token.balance, 0).catch(async () => {
                const poolAltContract = getContract(b.metadata.poolAddr, curvePoolAltAbi, provider)
                const uBalanceAlt = await poolAltContract.calc_withdraw_one_coin(b.token.balance, 0)
                return uBalanceAlt
              })
          return uBalance
        }
      } else {
        return ZERO
      }
    })
  )

  indices.forEach((i) => (balances[i].underlying[0].balance = uBalances[i]))

  const nativeBalances = await Promise.all(
    balances.map(async (b) => {
      if (b.token.balance.gt(ZERO) && !equalsIgnoreCase(b.underlying[0].address, ETH)) {
        const res = await get1InchPrice(b.underlying[0].address, ETH, b.underlying[0].balance.toString())
        return BigNumber.from(res.data.toTokenAmount)
      } else {
        return ZERO
      }
    })
  )

  indices.forEach((i) => (balances[i].eth.balance = nativeBalances[i]))

  return balances.filter((b) => b.token.balance.gt(ZERO))
}
