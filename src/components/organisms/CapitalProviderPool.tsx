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
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { Content } from '../atoms/Layout'
import { Heading1, Text } from '../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'
import { StyledTooltip } from '../molecules/Tooltip'

/* import constants */
import { CP_ROI, MAX_TABLET_SCREEN_WIDTH } from '../../constants'
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

  const { errors } = useGeneral()
  const { account } = useWallet()
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
      <Heading1 mb={0}>
        Options Mining Pool{' '}
        {/* <StyledTooltip
          id={'options-pool'}
          tip={'Deposit SCP tokens here to earn rewards'}
          link={'https://docs.solace.fi/docs/user-guides/capital-provider/cp-role-guide'}
        />{' '} */}
      </Heading1>
      <Text t4 pb={10}>
        This pool rewards capital providers with options
      </Text>
      {width > MAX_TABLET_SCREEN_WIDTH ? (
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {account ? <TableHeader width={100}>Your Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {account ? (
                <TableHeader>
                  My Rewards <StyledTooltip id={'cp-rewards'} tip={'Amount of your unclaimed rewards from this pool'} />
                </TableHeader>
              ) : null}
              {account ? (
                <TableHeader>
                  My Daily Rewards{' '}
                  <StyledTooltip id={'my-daily-cp-rewards'} tip={'Amount of rewards you earn from this pool per day'} />
                </TableHeader>
              ) : null}
              <TableHeader>
                Daily Rewards{' '}
                <StyledTooltip id={'daily-cp-rewards'} tip={'Total amount of rewards for this pool per day'} />
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {account ? (
                <TableData h3 high_em width={100}>
                  {truncateBalance(cpUserStakeValue, 2)}
                </TableData>
              ) : null}
              <TableData h3 high_em>
                {truncateBalance(cpPoolValue, 2)}
              </TableData>
              <TableData h3 high_em width={100}>
                {CP_ROI}
              </TableData>
              {account ? (
                <TableData h3 high_em>
                  {truncateBalance(cpUserRewards, 2)}
                </TableData>
              ) : null}
              {account ? (
                <TableData h3 high_em>
                  {truncateBalance(cpUserRewardsPerDay, 2)}
                </TableData>
              ) : null}
              <TableData h3 high_em>
                {truncateBalance(cpRewardsPerDay, 2)}
              </TableData>
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200}>
                    <Button disabled={errors.length > 0} onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit')}>
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.WITHDRAW_CP, 'Withdraw')}
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
              <FormCol h2 high_em>
                {truncateBalance(cpUserStakeValue, 2)}
              </FormCol>
            </FormRow>
          )}
          <FormRow>
            <FormCol>Total Assets:</FormCol>
            <FormCol h2 high_em>
              {truncateBalance(cpPoolValue, 2)}
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol>ROI:</FormCol>
            <FormCol h2 high_em>
              {CP_ROI}
            </FormCol>
          </FormRow>
          {account && (
            <>
              <FormRow>
                <FormCol>My Rewards:</FormCol>
                <FormCol h2 high_em>
                  {truncateBalance(cpUserRewards, 2)}
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol>My Daily Rewards:</FormCol>
                <FormCol h2 high_em>
                  {truncateBalance(cpUserRewardsPerDay, 2)}
                </FormCol>
              </FormRow>
            </>
          )}
          <FormRow>
            <FormCol>Daily Rewards:</FormCol>
            <FormCol h2 high_em>
              {truncateBalance(cpRewardsPerDay, 2)}
            </FormCol>
          </FormRow>
          {account && (
            <ButtonWrapper isColumn>
              <Button
                widthP={100}
                disabled={errors.length > 0}
                onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit')}
              >
                Deposit
              </Button>
              <Button
                widthP={100}
                disabled={errors.length > 0}
                onClick={() => openModal(FunctionName.WITHDRAW_CP, 'Withdraw')}
              >
                Withdraw
              </Button>
            </ButtonWrapper>
          )}
        </Card>
      )}
    </Content>
  )
}
