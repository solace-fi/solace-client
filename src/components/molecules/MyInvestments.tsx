/*************************************************************************************

    Table of Contents:

    import react
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

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Content } from '../atoms/Layout'
import { Heading1, Heading3 } from '../atoms/Typography'
import { CardContainer, InvestmentCard, CardHeader, CardTitle, CardBlock } from '../atoms/Card'

/* import constants */
import { Unit } from '../../constants/enums'
import { DEFAULT_CHAIN_ID } from '../../constants'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useFarm'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'

/* import utils */
import { getNativeTokenUnit, truncateBalance } from '../../utils/formatting'

export const MyInvestments: React.FC = () => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { account, chainId } = useWallet()
  const { cpFarm, lpFarm } = useContracts()
  const cpUserRewards = useUserPendingRewards(cpFarm)
  const lpUserRewards = useUserPendingRewards(lpFarm)
  const cpUserStakeValue = useUserStakedValue(cpFarm, account)
  const lpUserStakeValue = useUserStakedValue(lpFarm, account)
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
            <CardTitle h2>Capital Pool</CardTitle>
            <Heading3>
              {account ? truncateBalance(parseFloat(cpUserStakeValue), 2) : 0}{' '}
              {getNativeTokenUnit(chainId ?? DEFAULT_CHAIN_ID)}
            </Heading3>
          </CardHeader>
          <CardBlock>
            <CardTitle t2>Daily Earnings</CardTitle>
            <CardTitle t3>
              {account ? truncateBalance(parseFloat(cpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t2>Total Earnings</CardTitle>
            <CardTitle t3>
              {account ? truncateBalance(parseFloat(cpUserRewards), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard>
        <InvestmentCard>
          <CardHeader>
            <CardTitle h2>Liquidity Pool</CardTitle>
            <Heading3>
              {account ? truncateBalance(parseFloat(lpUserStakeValue), 2) : 0} {Unit.SOLACE}
            </Heading3>
          </CardHeader>
          <CardBlock>
            <CardTitle t2>Daily Earnings</CardTitle>
            <CardTitle t3>
              {account ? truncateBalance(parseFloat(lpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t2>Total Earnings</CardTitle>
            <CardTitle t3>
              {account ? truncateBalance(parseFloat(lpUserRewards), 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard>
      </CardContainer>
    </Content>
  )
}
