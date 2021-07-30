/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import constants
    import hooks
    import utils

    CapitalProviderPool function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Content } from '../atoms/Layout'
import { Heading1 } from '../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../atoms/Table'
import { Button } from '../atoms/Button'

/* import constants */
import { CP_ROI } from '../../constants'
import { FunctionName } from '../../constants/enums'

/* import hooks */
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../hooks/useFarm'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

interface CapitalProviderPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const CapitalProviderPool: React.FC<CapitalProviderPoolProps> = ({ openModal }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const wallet = useWallet()
  const { cpFarm } = useContracts()
  const cpUserStakeValue = useUserStakedValue(cpFarm, wallet.account)
  const cpRewardsPerDay = useRewardsPerDay(1)
  const cpUserRewardsPerDay = useUserRewardsPerDay(1, cpFarm, wallet.account)
  const [cpUserRewards] = useUserPendingRewards(cpFarm)
  const cpPoolValue = usePoolStakedValue(cpFarm)

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Content>
      <Heading1>Solace Capital Provider Farm</Heading1>
      <Table isHighlight textAlignCenter>
        <TableHead>
          <TableRow>
            {wallet.account ? <TableHeader width={100}>Your Stake</TableHeader> : null}
            <TableHeader>Total Assets</TableHeader>
            <TableHeader width={100}>ROI (1Y)</TableHeader>
            {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
            {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
            <TableHeader>Daily Rewards</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {wallet.account ? (
              <TableData width={100}>{truncateBalance(parseFloat(cpUserStakeValue), 2)}</TableData>
            ) : null}
            <TableData>{truncateBalance(parseFloat(cpPoolValue), 2)}</TableData>
            <TableData width={100}>{CP_ROI}</TableData>
            {wallet.account ? <TableData>{truncateBalance(parseFloat(cpUserRewards), 2)}</TableData> : null}
            {wallet.account ? <TableData>{truncateBalance(parseFloat(cpUserRewardsPerDay), 2)}</TableData> : null}
            <TableData>{truncateBalance(parseFloat(cpRewardsPerDay), 2)}</TableData>
            {wallet.account ? (
              <TableData textAlignRight>
                <TableDataGroup width={200}>
                  <Button
                    disabled={wallet.errors.length > 0}
                    onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit')}
                  >
                    Deposit
                  </Button>
                  <Button
                    disabled={wallet.errors.length > 0}
                    onClick={() => openModal(FunctionName.WITHDRAW_ETH, 'Withdraw')}
                  >
                    Withdraw
                  </Button>
                </TableDataGroup>
              </TableData>
            ) : null}
          </TableRow>
        </TableBody>
      </Table>
    </Content>
  )
}
