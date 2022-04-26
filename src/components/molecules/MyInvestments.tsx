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

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Content } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { CardContainer, InvestmentCard, CardHeader, CardTitle, CardBlock } from '../atoms/Card'

/* import constants */
import { Unit } from '../../constants/enums'

/* import hooks */
import { useUserStakedValue } from '../../hooks/_legacy/useFarm'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/_legacy/useRewards'

/* import utils */
import { truncateValue } from '../../utils/formatting'
import { useWeb3React } from '@web3-react/core'

export const MyInvestments: React.FC = () => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { cpFarm } = useMemo(() => keyContracts, [keyContracts])
  const cpUserRewards = useUserPendingRewards(cpFarm)
  const cpUserStakeValue = useUserStakedValue(cpFarm)
  const cpUserRewardsPerDay = useUserRewardsPerDay(1, cpFarm)

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
              {account ? truncateValue(cpUserStakeValue, 2) : 0} {activeNetwork.nativeCurrency.symbol}
            </CardTitle>
          </CardHeader>
          <CardBlock>
            <CardTitle t4>Daily Earnings</CardTitle>
            <CardTitle t3 nowrap>
              {account ? truncateValue(cpUserRewardsPerDay, 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
          <CardBlock>
            <CardTitle t4>Total Earnings</CardTitle>
            <CardTitle t3 nowrap>
              {account ? truncateValue(cpUserRewards, 2) : 0} {Unit.SOLACE}
            </CardTitle>
          </CardBlock>
        </InvestmentCard>
      </CardContainer>
    </Content>
  )
}
