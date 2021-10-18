import { NetworkConfig, Token } from '../../../constants/types'
import { rangeFrom0 } from '../../../utils/numeric'
import { Contract } from '@ethersproject/contracts'
import { addNativeTokenBalances, getProductTokenBalances, queryNativeTokenBalance } from '../../getBalances'
import { getNonHumanValue } from '../../../utils/formatting'
import ierc20Json from '../../_contracts/IERC20Metadata.json'
import { BigNumber } from 'ethers'
import { withBackoffRetries } from '../../../utils/time'
import axios from 'axios'
import { equalsIgnoreCase } from '../../../utils'

const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getBalances = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<Token[]> => {
  const balances: Token[] = await getProductTokenBalances(user, ierc20Json.abi, tokens, provider)

  for (let i = 0; i < balances.length; i++) {
    if (!equalsIgnoreCase(balances[i].underlying[0].address, ETH)) {
      const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${
        balances[i].underlying[0].address
      }&toTokenAddress=${ETH}&amount=${balances[i].token.balance
        .div(String(getNonHumanValue(1, balances[i].token.decimals - balances[i].underlying[0].decimals)))
        .toString()}`
      try {
        const res = await withBackoffRetries(async () => axios.get(url))
        const ethAmount: BigNumber = BigNumber.from(res.data.toTokenAmount)
        balances[i].eth.balance = ethAmount
      } catch (e) {
        console.log(e)
      }
    } else {
      balances[i].eth.balance = balances[i].token.balance
    }
  }

  return balances
}
