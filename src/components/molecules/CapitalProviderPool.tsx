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
import { Button, ButtonWrapper } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'

/* import constants */
import { CP_ROI } from '../../constants'
import { FunctionName } from '../../constants/enums'

/* import hooks */
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../hooks/useFarm'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

interface CapitalProviderPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const CapitalProviderPool: React.FC<CapitalProviderPoolProps> = ({ openModal }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { account, errors } = useWallet()
  const { width } = useWindowDimensions()
  const { cpFarm } = useContracts()
  const cpUserStakeValue = useUserStakedValue(cpFarm, account)
  const cpRewardsPerDay = useRewardsPerDay(1)
  const cpUserRewardsPerDay = useUserRewardsPerDay(1, cpFarm, account)
  const cpUserRewards = useUserPendingRewards(cpFarm)
  const cpPoolValue = usePoolStakedValue(cpFarm)

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Content>
      <Heading1>Solace Capital Provider Farm</Heading1>
      {width > 1080 ? (
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {account ? <TableHeader width={100}>Your Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {account ? <TableHeader>My Rewards</TableHeader> : null}
              {account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {account ? <TableData width={100}>{truncateBalance(parseFloat(cpUserStakeValue), 2)}</TableData> : null}
              <TableData>{truncateBalance(parseFloat(cpPoolValue), 2)}</TableData>
              <TableData width={100}>{CP_ROI}</TableData>
              {account ? <TableData>{truncateBalance(parseFloat(cpUserRewards), 2)}</TableData> : null}
              {account ? <TableData>{truncateBalance(parseFloat(cpUserRewardsPerDay), 2)}</TableData> : null}
              <TableData>{truncateBalance(parseFloat(cpRewardsPerDay), 2)}</TableData>
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200}>
                    <Button disabled={errors.length > 0} onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit')}>
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
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
      ) : (
        <Card>
          {account && (
            <FormRow>
              <FormCol>Your Stake:</FormCol>
              <FormCol>{truncateBalance(parseFloat(cpUserStakeValue), 2)}</FormCol>
            </FormRow>
          )}
          <FormRow>
            <FormCol>Total Assets:</FormCol>
            <FormCol>{truncateBalance(parseFloat(cpPoolValue), 2)}</FormCol>
          </FormRow>
          <FormRow>
            <FormCol>ROI:</FormCol>
            <FormCol>{CP_ROI}</FormCol>
          </FormRow>
          {account && (
            <>
              <FormRow>
                <FormCol>My Rewards:</FormCol>
                <FormCol>{truncateBalance(parseFloat(cpUserRewards), 2)}</FormCol>
              </FormRow>
              <FormRow>
                <FormCol>My Daily Rewards:</FormCol>
                <FormCol>{truncateBalance(parseFloat(cpUserRewardsPerDay), 2)}</FormCol>
              </FormRow>
            </>
          )}
          <FormRow>
            <FormCol>Daily Rewards:</FormCol>
            <FormCol>{truncateBalance(parseFloat(cpRewardsPerDay), 2)}</FormCol>
          </FormRow>
          {account && (
            <ButtonWrapper>
              <Button disabled={errors.length > 0} onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit')}>
                Deposit
              </Button>
              <Button disabled={errors.length > 0} onClick={() => openModal(FunctionName.WITHDRAW_ETH, 'Withdraw')}>
                Withdraw
              </Button>
            </ButtonWrapper>
          )}
        </Card>
      )}
    </Content>
  )
}
