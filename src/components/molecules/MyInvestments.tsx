/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    MyInvestments function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Content } from '../atoms/Layout'
import { Heading1, Heading3 } from '../atoms/Typography'
import { CardContainer, InvestmentCard, CardHeader, CardTitle, CardBlock } from '../atoms/Card'

/* import constants */
import { Unit } from '../../constants/enums'
import { ZERO } from '../../constants'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useFarm'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useDepositedLpBalance } from '../../hooks/useBalance'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

export const MyInvestments: React.FC = () => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { account } = useWallet()
  const { activeNetwork } = useNetwork()
  const { cpFarm, lpFarm } = useContracts()
  const cpUserRewards = useUserPendingRewards(cpFarm)
  const lpUserRewards = useUserPendingRewards(lpFarm)
  const cpUserStakeValue = useUserStakedValue(cpFarm, account)
  const lpUserStakeValue = useUserStakedValue(lpFarm, account)
  // const depositedLpTokenInfo = useDepositedLpBalance()
  const cpUserRewardsPerDay = useUserRewardsPerDay(1, cpFarm, account)
  const lpUserRewardsPerDay = useUserRewardsPerDay(2, lpFarm, account)

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Content>
      <Heading1>Your Investments</Heading1>
      <CardContainer>
        <InvestmentCard>
          <CardHeader>
            <CardTitle t4>Capital Pool</CardTitle>
            <CardTitle h3 nowrap high_em>
              {account ? truncateBalance(parseFloat(cpUserStakeValue), 2) : 0} {activeNetwork.nativeCurrency.symbol}
            </CardTitle>
          </CardHeader>
          <CardBlock>
            <CardTitle t4>Daily Earnings</CardTitle>
            <CardTitle h3 nowrap high_em>
              {account ? truncateBalance(parseFloat(cpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t4>Total Earnings</CardTitle>
            <CardTitle h3 nowrap high_em>
              {account ? truncateBalance(parseFloat(cpUserRewards), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard>
        <InvestmentCard>
          <CardHeader>
            <CardTitle t4>Liquidity Pool</CardTitle>
            <CardTitle h3 nowrap high_em>
              {/* {account
                ? truncateBalance(
                    formatUnits(depositedLpTokenInfo.reduce((a, b) => a.add(b.value), ZERO).toString(), currencyDecimals),
                    2
                  )
                : 0}{' '}
              {Unit.SOLACE} */}
              {account ? truncateBalance(parseFloat(lpUserStakeValue), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardHeader>
          <CardBlock>
            <CardTitle t4>Daily Earnings</CardTitle>
            <CardTitle h3 nowrap high_em>
              {account ? truncateBalance(parseFloat(lpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t4>Total Earnings</CardTitle>
            <CardTitle h3 nowrap high_em>
              {account ? truncateBalance(parseFloat(lpUserRewards), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard>
      </CardContainer>
    </Content>
  )
}
