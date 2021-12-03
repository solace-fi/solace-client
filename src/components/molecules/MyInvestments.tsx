/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    MyInvestments
      hooks

  *************************************************************************************/

/* import packages */
import React, { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Content } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
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

    hooks

  *************************************************************************************/
  const { account } = useWallet()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { cpFarm, lpFarm } = useMemo(() => keyContracts, [keyContracts])
  const cpUserRewards = useUserPendingRewards(cpFarm)
  const lpUserRewards = useUserPendingRewards(lpFarm)
  const cpUserStakeValue = useUserStakedValue(cpFarm)
  const lpUserStakeValue = useUserStakedValue(lpFarm)
  // const depositedNftTokenInfo = useDepositedLpBalance()
  const cpUserRewardsPerDay = useUserRewardsPerDay(1, cpFarm)
  const lpUserRewardsPerDay = useUserRewardsPerDay(2, lpFarm)

  return (
    <Content>
      <Text t1 bold>
        My Investments
      </Text>
      <CardContainer style={{ overflowX: 'auto' }}>
        <InvestmentCard>
          <CardHeader>
            <CardTitle t4>Options Farming Pool</CardTitle>
            <CardTitle t3 nowrap>
              {account ? truncateBalance(cpUserStakeValue, 2) : 0} {activeNetwork.nativeCurrency.symbol}
            </CardTitle>
          </CardHeader>
          <CardBlock>
            <CardTitle t4>Daily Earnings</CardTitle>
            <CardTitle t3 nowrap>
              {account ? truncateBalance(cpUserRewardsPerDay, 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t4>Total Earnings</CardTitle>
            <CardTitle t3 nowrap>
              {account ? truncateBalance(cpUserRewards, 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard>
        {/* <InvestmentCard>
          <CardHeader>
            <CardTitle t4>Liquidity Pool</CardTitle>
            <CardTitle t3 nowrap>
              {account
                ? truncateBalance(
                    formatUnits(depositedNftTokenInfo.reduce((a, b) => a.add(b.value), ZERO).toString(), currencyDecimals),
                    2
                  )
                : 0}{' '}
              {Unit.SOLACE}
              {account ? truncateBalance(lpUserStakeValue, 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardHeader>
          <CardBlock>
            <CardTitle t4>Daily Earnings</CardTitle>
            <CardTitle t3 nowrap>
              {account ? truncateBalance(lpUserRewardsPerDay, 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t4>Total Earnings</CardTitle>
            <CardTitle t3 nowrap>
              {account ? truncateBalance(lpUserRewards, 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard> */}
      </CardContainer>
    </Content>
  )
}
