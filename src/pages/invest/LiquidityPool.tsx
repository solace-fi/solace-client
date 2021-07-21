import React from 'react'
import { Content } from '../../components/Layout'
import { Heading1 } from '../../components/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { LP_ROI } from '../../constants'
import { useWallet } from '../../context/WalletManager'
import { Button } from '../../components/Button'
import { truncateBalance } from '../../utils/formatting'
import { FunctionName } from '../../constants/enums'
import { useContracts } from '../../context/ContractsManager'
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../hooks/useFarm'

interface LiquidityPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const LiquidityPool: React.FC<LiquidityPoolProps> = ({ openModal }) => {
  const wallet = useWallet()
  const { lpFarm } = useContracts()

  const lpRewardsPerDay = useRewardsPerDay(2)
  const lpUserRewardsPerDay = useUserRewardsPerDay(2, lpFarm, wallet.account)
  const [lpUserRewards] = useUserPendingRewards(lpFarm)

  const lpPoolValue = usePoolStakedValue(lpFarm)
  const lpUserStakeValue = useUserStakedValue(lpFarm, wallet.account)

  return (
    <Content>
      <Heading1>SOLACE/ETH Liquidity Pool</Heading1>
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
              <TableData width={100}>{truncateBalance(parseFloat(lpUserStakeValue), 2)}</TableData>
            ) : null}
            <TableData>{truncateBalance(parseFloat(lpPoolValue), 2)}</TableData>
            <TableData width={100}>{LP_ROI}</TableData>
            {wallet.account ? <TableData>{truncateBalance(parseFloat(lpUserRewards), 2)}</TableData> : null}
            {wallet.account ? <TableData>{truncateBalance(parseFloat(lpUserRewardsPerDay), 2)}</TableData> : null}
            <TableData>{truncateBalance(parseFloat(lpRewardsPerDay), 2)}</TableData>
            {wallet.account ? (
              <TableData textAlignRight>
                <TableDataGroup width={200}>
                  <Button
                    disabled={wallet.errors.length > 0}
                    onClick={() => openModal(FunctionName.DEPOSIT_LP, 'Deposit')}
                  >
                    Deposit
                  </Button>
                  <Button
                    disabled={wallet.errors.length > 0}
                    onClick={() => openModal(FunctionName.WITHDRAW_LP, 'Withdraw')}
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
