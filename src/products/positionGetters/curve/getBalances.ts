import { NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances, getProductTokenBalances, queryNativeTokenBalance } from '../getBalances'
import { getNonHumanValue } from '../../../utils/formatting'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { BigNumber } from 'ethers'
import { getContract } from '../../../utils'
import { withBackoffRetries } from '../../../utils/time'
import axios from 'axios'

import curveAddressProviderAbi from './_contracts/ICurveAddressProvider.json'
import curveRegistryAbi from './_contracts/ICurveRegistry.json'
import curvePoolAbi from './_contracts/ICurvePool.json'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  const balances: Token[] = await getProductTokenBalances(user, ierc20Json.abi, tokens, provider)

  const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'
  const curveAddressProviderContract = getContract(CURVE_ADDRRESS_PROVIDER_ADDR, curveAddressProviderAbi.abi, provider)

  const registryAddr = await curveAddressProviderContract.get_registry()
  const curveRegistryContract = getContract(registryAddr, curveRegistryAbi.abi, provider)

  const indices = rangeFrom0(balances.length)

  indices.forEach(async (i) => {
    console.log('balances.token.address', balances[i].token.address)
    const poolAddr = await curveRegistryContract.get_pool_from_lp_token(balances[i].token.address)
    console.log('poolAddr', poolAddr)
    const poolContract = getContract(poolAddr, curvePoolAbi.abi, provider)
    console.log('poolContract', poolContract)
    const coin = await poolContract.coins(0)
    console.log('coin', coin)
    const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${coin}&toTokenAddress=${ETH}&amount=${balances[
      i
    ].token.balance.toString()}`
    try {
      const res = await withBackoffRetries(async () => axios.get(url))
      const ethAmount: BigNumber = BigNumber.from(res.data.toTokenAmount)
      balances[i].eth.balance = ethAmount
    } catch (e) {
      console.log(e)
    }
  })

  return balances
}
