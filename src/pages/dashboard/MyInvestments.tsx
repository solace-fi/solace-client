/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import hooks
    import utils

    MyInvestments function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Content } from '../../components/Layout'
import { Heading1, Heading3 } from '../../components/Text'
import { CardContainer, InvestmentCard, CardHeader, CardTitle, CardBlock } from '../../components/Card'
import { Unit } from '../../constants/enums'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

export const MyInvestments = () => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const wallet = useWallet()
  const { cpFarm, lpFarm } = useContracts()
  const [cpUserRewards] = useUserPendingRewards(cpFarm)
  const [cpUserRewardsPerDay] = useUserRewardsPerDay(1, cpFarm)
  const [lpUserRewards] = useUserPendingRewards(lpFarm)
  const [lpUserRewardsPerDay] = useUserRewardsPerDay(2, lpFarm)
  const cpUserStakeValue = useUserStakedValue(cpFarm)
  const lpUserStakeValue = useUserStakedValue(lpFarm)

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Content>
      <Heading1>Your Investments</Heading1>
      <CardContainer>
        <InvestmentCard>
          <CardHeader>
            <CardTitle h2>Capital Pool</CardTitle>
            <Heading3>
              {wallet.account ? truncateBalance(parseFloat(cpUserStakeValue), 2) : 0} {Unit.ETH}
            </Heading3>
          </CardHeader>
          <CardBlock>
            <CardTitle t2>Daily Earnings</CardTitle>
            <CardTitle t3>
              {wallet.account ? truncateBalance(parseFloat(cpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t2>Total Earnings</CardTitle>
            <CardTitle t3>
              {wallet.account ? truncateBalance(parseFloat(cpUserRewards), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard>
        <InvestmentCard>
          <CardHeader>
            <CardTitle h2>Liquidity Pool</CardTitle>
            <Heading3>
              {wallet.account ? truncateBalance(parseFloat(lpUserStakeValue), 2) : 0} {Unit.SOLACE}
            </Heading3>
          </CardHeader>
          <CardBlock>
            <CardTitle t2>Daily Earnings</CardTitle>
            <CardTitle t3>
              {wallet.account ? truncateBalance(parseFloat(lpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t2>Total Earnings</CardTitle>
            <CardTitle t3>
              {wallet.account ? truncateBalance(parseFloat(lpUserRewards), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard>
      </CardContainer>
    </Content>
  )
}
