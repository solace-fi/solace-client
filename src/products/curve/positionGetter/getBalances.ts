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
import curveRegistryAbi from './_contracts/ICurveRegistry.json'
import curvePoolAbi from './_contracts/ICurvePool.json'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const CURVE_ADDRRESS_PROVIDER_ADDR = '0x0000000022D53366457F9d5E68Ec105046FC4383'

const mainnetCurveLpNames = [
  'Curve.fi DAI/USDC/USDT',
  'Curve.fi aDAI/aUSDC/aUSDT',
  'Curve.fi ETH/aETH',
  'Curve.fi yDAI/yUSDC/yUSDT/yBUSD',
  'Curve.fi cDAI/cUSDC',
  'Curve.fi EURS/sEUR',
  'Curve.fi hBTC/wBTC',
  'Curve.fi cyDAI/cyUSDC/cyUSDT',
  'Curve.fi LINK/sLINK',
  'Curve.fi DAI/USDC/USDT/PAX',
  'Curve.fi renBTC/wBTC',
  'Curve.fi aDAI/aSUSD',
  'Curve.fi renBTC/wBTC/sBTC',
  'Curve.fi ETH/sETH',
  'Curve.fi ETH/stETH',
  'Curve.fi DAI/USDC/USDT/sUSD',
  'Curve.fi cDAI/cUSDC/USDT',
  'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
  'Curve.fi DUSD/3Crv',
  'Curve.fi GUSD/3Crv',
  'Curve.fi HUSD/3Crv',
  'Curve.fi LinkUSD/3Crv',
  'Curve.fi MUSD/3Crv',
  'Curve.fi RSV/3Crv',
  'Curve.fi USDK/3Crv',
  'Curve.fi USDN/3Crv',
  'Curve.fi USDP/3Crv',
  'Curve.fi UST/3Crv',
  'Curve.fi bBTC/sbtcCRV',
  'Curve.fi oBTC/sbtcCRV',
  'Curve.fi pBTC/sbtcCRV',
  'Curve.fi tBTC/sbtcCrv',
  'Curve.fi Factory USD Metapool: TrueUSD',
  'Curve.fi Factory USD Metapool: Liquity',
  'Curve.fi Factory USD Metapool: Frax',
  'Curve.fi Factory USD Metapool: Binance USD',
  'Curve.fi ETH/rETH',
  'Curve.fi Factory USD Metapool: Alchemix USD',
  'Curve.fi USD-BTC-ETH',
  'Curve.fi Factory USD Metapool: Magic Internet Money 3Pool',
  'Curve.fi Factory Plain Pool: Euro Tether',
]

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  const balances: Token[] = await getProductTokenBalances(user, ierc20Json.abi, tokens, provider)

  const curveAddressProviderContract = getContract(CURVE_ADDRRESS_PROVIDER_ADDR, curveAddressProviderAbi.abi, provider)
  const curveRegistryAddress = await curveAddressProviderContract.get_registry()
  const curveRegistryContract = getContract(curveRegistryAddress, curveRegistryAbi, provider)

  for (let i = 0; i < balances.length; i++) {
    const poolAddr = await curveRegistryContract.get_pool_from_lp_token(balances[i].token.address)
    const poolContract = getContract(poolAddr, curvePoolAbi, provider)

    const uBalance = await poolContract.calc_withdraw_one_coin(balances[i].token.balance, 0)

    console.log('uBalance', uBalance)

    balances[i].underlying[0].balance = uBalance

    console.log('balances[i].underlying[0].balance', balances[i].underlying[0].balance)

    // console.log(balances[i].token.decimals - balances[i].underlying[0].decimals)

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

  return balances
}
