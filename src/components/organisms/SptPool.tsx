/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    SptPool
      hooks
      local functions

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { BKPT_4, BKPT_6 } from '../../constants'

/* import components */
import { Content } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { FormRow, FormCol } from '../atoms/Form'
import { Card } from '../atoms/Card'
import { HyperLink } from '../atoms/Link'
import { StyledTooltip } from '../molecules/Tooltip'

/* import hooks */
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../hooks/useFarm'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

interface SptPoolProps {
  openModal: (func: FunctionName, modalTitle: string, farmName: string) => void
}

export const SptPool: React.FC<SptPoolProps> = ({ openModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { account } = useWallet()
  const { sptFarm } = useContracts()
  const { width } = useWindowDimensions()

  const sptRewardsPerDay = useRewardsPerDay(3)
  const sptUserRewardsPerDay = useUserRewardsPerDay(3, sptFarm, account)
  const sptUserRewards = useUserPendingRewards(sptFarm)
  const sptPoolValue = usePoolStakedValue(sptFarm)
  const sptUserStakeValue = useUserStakedValue(sptFarm, account)

  return (
    <Content>
      <Text bold t1 mb={0} info>
        Policy Whirlpool
      </Text>
      <Text t4 pt={10} pb={10}>
        Stake your policies here and earn even more rewards.
        <HyperLink
          t4
          href={'https://medium.com/solace-fi/dear-policyholder-these-rewards-are-for-you-153ff190058'}
          target="_blank"
          rel="noopener noreferrer"
          info
        >
          {' '}
          More information here.
        </HyperLink>
      </Text>
      {width > BKPT_6 ? (
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
            <TableRow light>
              {account ? (
                <TableData t3 width={100}>
                  {truncateBalance(sptUserStakeValue, 2)}
                </TableData>
              ) : null}
              <TableData t3>{truncateBalance(sptPoolValue, 2)}</TableData>
              <TableData t3 width={100}>
                N/A
              </TableData>
              {account ? <TableData t3>{truncateBalance(sptUserRewards, 2)}</TableData> : null}
              {account ? <TableData t3>{truncateBalance(sptUserRewardsPerDay, 2)}</TableData> : null}
              <TableData t3>{truncateBalance(sptRewardsPerDay, 2)}</TableData>
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200} style={{ float: 'right' }}>
                    <Button
                      light
                      disabled={haveErrors}
                      onClick={() => openModal(FunctionName.DEPOSIT_POLICY_SIGNED, 'Deposit', 'spt')}
                    >
                      Deposit
                    </Button>
                    <Button
                      light
                      disabled={haveErrors}
                      onClick={() => openModal(FunctionName.WITHDRAW_POLICY, 'Withdraw', 'spt')}
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
        // tablet version
        <Card isHighlight>
          {account && (
            <FormRow>
              <FormCol light>My Stake:</FormCol>
              <FormCol light t2>
                {truncateBalance(sptUserStakeValue, 2)}
              </FormCol>
            </FormRow>
          )}
          <FormRow>
            <FormCol light>Total Assets:</FormCol>
            <FormCol light t2>
              {truncateBalance(sptPoolValue, 2)}
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol light>ROI:</FormCol>
            <FormCol light t2>
              N/A
            </FormCol>
          </FormRow>
          {account && (
            <>
              <FormRow>
                <FormCol light>My Rewards:</FormCol>
                <FormCol light t2>
                  {truncateBalance(sptUserRewards, 2)}
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol light>My Daily Rewards:</FormCol>
                <FormCol light t2>
                  {truncateBalance(sptUserRewardsPerDay, 2)}
                </FormCol>
              </FormRow>
            </>
          )}
          <FormRow>
            <FormCol light>Daily Rewards:</FormCol>
            <FormCol light t2>
              {truncateBalance(sptRewardsPerDay, 2)}
            </FormCol>
          </FormRow>
          {account && (
            <ButtonWrapper isColumn={width <= BKPT_4}>
              <Button
                widthP={100}
                disabled={haveErrors}
                onClick={() => openModal(FunctionName.DEPOSIT_POLICY_SIGNED, 'Deposit', 'spt')}
                light
              >
                Deposit
              </Button>
              <Button
                widthP={100}
                disabled={haveErrors}
                onClick={() => openModal(FunctionName.WITHDRAW_POLICY, 'Withdraw', 'spt')}
                light
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
