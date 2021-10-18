/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    LiquidityPool
      hooks
      local functions
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { LP_ROI, BKPT_4, BKPT_6 } from '../../constants'

/* import components */
import { Content } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { FormRow, FormCol } from '../atoms/Form'
import { Card } from '../atoms/Card'
import { StyledTooltip } from '../molecules/Tooltip'

/* import hooks */
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../hooks/useFarm'
import { useDepositedLpBalance } from '../../hooks/useBalance'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

interface LiquidityPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const LiquidityPool: React.FC<LiquidityPoolProps> = ({ openModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { account } = useWallet()
  const { lpFarm } = useContracts()
  const { width } = useWindowDimensions()
  const { currencyDecimals } = useNetwork()

  const lpRewardsPerDay = useRewardsPerDay(2)
  const lpUserRewardsPerDay = useUserRewardsPerDay(2, lpFarm, account)
  const lpUserRewards = useUserPendingRewards(lpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)
  const lpUserStakeValue = useUserStakedValue(lpFarm, account)
  // const depositedLpTokenInfo = useDepositedLpBalance()

  return (
    <Content>
      <Text bold t1 mb={0} info>
        SOLACE Liquidity Pool{' '}
        {/* <StyledTooltip
          id={'lp-farm'}
          tip={'Deposit Uniswap V3 SOLACE-ETH LP tokens here to earn rewards'}
          link={'https://docs.solace.fi/docs/user-guides/liquidity-provider/lp-role-guide'}
        /> */}
      </Text>
      <Text t4 pb={10}>
        Manage your Uniswap V3 SOLACE-ETH LP tokens in this pool and earn rewards
      </Text>
      {width > BKPT_6 ? (
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {account ? <TableHeader width={100}>Your Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              {/* <TableHeader width={100}>ROI (1Y)</TableHeader> */}
              {account ? (
                <TableHeader>
                  {' '}
                  My Rewards <StyledTooltip id={'lp-rewards'} tip={'Amount of your unclaimed rewards from this pool'} />
                </TableHeader>
              ) : null}
              {account ? (
                <TableHeader>
                  My Daily Rewards{' '}
                  <StyledTooltip id={'my-daily-lp-rewards'} tip={'Amount of rewards you earn from this pool per day'} />
                </TableHeader>
              ) : null}
              <TableHeader>
                Daily Rewards{' '}
                <StyledTooltip id={'daily-lp-rewards'} tip={'Total amount of rewards for this pool per day'} />
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow light>
              {/* {account ? (
                <TableData width={100}>
                  {truncateBalance(
                    formatUnits(depositedLpTokenInfo.reduce((a, b) => a.add(b.value), ZERO).toString(), currencyDecimals),
                    2
                  )}
                </TableData>
              ) : null} */}
              {account ? (
                <TableData t3 width={100}>
                  {truncateBalance(lpUserStakeValue, 2)}
                </TableData>
              ) : null}
              <TableData t3>{truncateBalance(lpPoolValue, 2)}</TableData>
              {/* <TableData t3 width={100}>
                {LP_ROI}
              </TableData> */}
              {account ? <TableData t3>{truncateBalance(lpUserRewards, 2)}</TableData> : null}
              {account ? <TableData t3>{truncateBalance(lpUserRewardsPerDay, 2)}</TableData> : null}
              <TableData t3>{truncateBalance(lpRewardsPerDay, 2)}</TableData>
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200} style={{ float: 'right' }}>
                    <Button
                      light
                      disabled={haveErrors}
                      onClick={() => openModal(FunctionName.DEPOSIT_SIGNED, 'Deposit')}
                    >
                      Deposit
                    </Button>
                    <Button light disabled={haveErrors} onClick={() => openModal(FunctionName.WITHDRAW_LP, 'Withdraw')}>
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
              <FormCol light>Your Stake:</FormCol>
              <FormCol light t2>
                {truncateBalance(lpUserStakeValue, 2)}
              </FormCol>
            </FormRow>
          )}
          <FormRow>
            <FormCol light>Total Assets:</FormCol>
            <FormCol light t2>
              {truncateBalance(lpPoolValue, 2)}
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol light>ROI:</FormCol>
            <FormCol light t2>
              {LP_ROI}
            </FormCol>
          </FormRow>
          {account && (
            <>
              <FormRow>
                <FormCol light>My Rewards:</FormCol>
                <FormCol light t2>
                  {truncateBalance(lpUserRewards, 2)}
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol light>My Daily Rewards:</FormCol>
                <FormCol light t2>
                  {truncateBalance(lpUserRewardsPerDay, 2)}
                </FormCol>
              </FormRow>
            </>
          )}
          <FormRow>
            <FormCol light>Daily Rewards:</FormCol>
            <FormCol light t2>
              {truncateBalance(lpRewardsPerDay, 2)}
            </FormCol>
          </FormRow>
          {account && (
            <ButtonWrapper isColumn={width <= BKPT_4}>
              <Button
                widthP={100}
                disabled={haveErrors}
                onClick={() => openModal(FunctionName.DEPOSIT_SIGNED, 'Deposit')}
                light
              >
                Deposit
              </Button>
              <Button
                widthP={100}
                disabled={haveErrors}
                onClick={() => openModal(FunctionName.WITHDRAW_LP, 'Withdraw')}
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
