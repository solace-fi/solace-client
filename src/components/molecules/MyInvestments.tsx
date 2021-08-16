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
            <CardTitle h2>Capital Pool</CardTitle>
            <Heading3>
              {account ? truncateBalance(parseFloat(cpUserStakeValue), 2) : 0} {activeNetwork.nativeCurrency.symbol}
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
              {/* {account
                ? truncateBalance(
                    formatUnits(depositedLpTokenInfo.reduce((a, b) => a.add(b.value), ZERO).toString(), currencyDecimals),
                    2
                  )
                : 0}{' '}
              {Unit.SOLACE} */}
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
