import { NetworkConfig, Token } from '../../../../constants/types'
import { getContract } from '../../../../utils'
import { ADDRESS_ZERO, ZERO } from '../../../../constants'
import { BigNumber } from 'ethers'
import curveGaugeAbi from '../_contracts/ICurveGauge.json'

import { queryBalance } from '../../../../utils/contract'

export const getAmounts_CurveGauge = async (
  user: string,
  provider: any,
  activeNetwork: NetworkConfig,
  tokens: Token[]
): Promise<BigNumber[]> => {
  // each index is for the token, each element at the index is the deposit
  const amounts: BigNumber[] = []
  for (let i = 0; i < tokens.length; i++) {
    let totalGaugeDeposit = ZERO
    for (let j = 0; j < tokens[i].metadata.gauges.length; j++) {
      const gauge = tokens[i].metadata.gauges[j]
      if (gauge.address != ADDRESS_ZERO) {
        const gaugeContract = getContract(gauge.address, curveGaugeAbi, provider)
        const balance = await queryBalance(gaugeContract, user)
        totalGaugeDeposit = totalGaugeDeposit.add(balance)
      }
    }
    amounts.push(totalGaugeDeposit)
  }
  return amounts
}
