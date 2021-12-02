/*************************************************************************************

    Table of Contents:

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

/* import packages */
import React, { useMemo } from 'react'
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

/* import hooks */
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../hooks/useFarm'
import { useDepositedLpBalance } from '../../hooks/useBalance'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

interface LiquidityPoolProps {
  openModal: (func: FunctionName, modalTitle: string, farmName: string) => void
}

export const LiquidityPool: React.FC<LiquidityPoolProps> = ({ openModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { account } = useWallet()
  const { keyContracts } = useContracts()
  const { lpFarm } = useMemo(() => keyContracts, [keyContracts])
  const { width } = useWindowDimensions()
  const { currencyDecimals } = useNetwork()

  const lpRewardsPerDay = useRewardsPerDay(2)
  const lpUserRewardsPerDay = useUserRewardsPerDay(2, lpFarm)
  const lpUserRewards = useUserPendingRewards(lpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)
  const lpUserStakeValue = useUserStakedValue(lpFarm)
  // const depositedNftTokenInfo = useDepositedLpBalance()

  return (
    <Content>
      <Text bold t1 mb={0} info>
        SOLACE Liquidity Pool
      </Text>
      <Text t4 pt={10} pb={10}>
        Manage your Uniswap V3 SOLACE-ETH LP tokens in this pool and earn rewards
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
              {/* {account ? (
                <TableData width={100}>
                  {truncateBalance(
                    formatUnits(depositedNftTokenInfo.reduce((a, b) => a.add(b.value), ZERO).toString(), currencyDecimals),
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
              <TableData t3 width={100}>
                N?A
              </TableData>
              {account ? <TableData t3>{truncateBalance(lpUserRewards, 2)}</TableData> : null}
              {account ? <TableData t3>{truncateBalance(lpUserRewardsPerDay, 2)}</TableData> : null}
              <TableData t3>{truncateBalance(lpRewardsPerDay, 2)}</TableData>
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200} style={{ float: 'right' }}>
                    <Button
                      light
                      disabled={haveErrors}
                      onClick={() => openModal(FunctionName.DEPOSIT_LP_SIGNED, 'Deposit', 'lp')}
                    >
                      Deposit
                    </Button>
                    <Button
                      light
                      disabled={haveErrors}
                      onClick={() => openModal(FunctionName.WITHDRAW_LP, 'Withdraw', 'lp')}
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
              N/A
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
                onClick={() => openModal(FunctionName.DEPOSIT_LP_SIGNED, 'Deposit', 'lp')}
                light
              >
                Deposit
              </Button>
              <Button
                widthP={100}
                disabled={haveErrors}
                onClick={() => openModal(FunctionName.WITHDRAW_LP, 'Withdraw', 'lp')}
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
