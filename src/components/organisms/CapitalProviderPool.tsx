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
import { Text } from '../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'
import { StyledTooltip } from '../molecules/Tooltip'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'

/* import constants */
import { CP_ROI, BKPT_4, BKPT_6, BKPT_7 } from '../../constants'
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
      <Text bold t1 mb={0} info>
        Options Farming Pool{' '}
        {/* <StyledTooltip
          id={'options-pool'}
          tip={'Deposit SCP tokens here to earn rewards'}
          link={'https://docs.solace.fi/docs/user-guides/capital-provider/cp-role-guide'}
        />{' '} */}
      </Text>
      <Text t4 pb={10}>
        This pool rewards capital providers with options
      </Text>
      {width > BKPT_6 ? (
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {account ? <TableHeader>Your Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              {/* <TableHeader>ROI (1Y)</TableHeader> */}
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
            <TableRow light>
              {account ? <TableData t3>{truncateBalance(cpUserStakeValue, 2)}</TableData> : null}
              <TableData t3>{truncateBalance(cpPoolValue, 2)}</TableData>
              {/* <TableData t3>{CP_ROI}</TableData> */}
              {account ? <TableData t3>{truncateBalance(cpUserRewards, 2)}</TableData> : null}
              {account ? <TableData t3>{truncateBalance(cpUserRewardsPerDay, 2)}</TableData> : null}
              <TableData t3>{truncateBalance(cpRewardsPerDay, 2)}</TableData>
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200} style={{ float: 'right' }}>
                    <Button
                      light
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit')}
                    >
                      Deposit
                    </Button>
                    <Button
                      light
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.WITHDRAW_CP, 'Withdraw')}
                    >
                      Withdraw
                    </Button>
                    {/* <Button light disabled={errors.length > 0} style={{ whiteSpace: 'nowrap' }}>
                      Claim Option
                    </Button> */}
                  </TableDataGroup>
                </TableData>
              ) : null}
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        // ) : width > BKPT_6 ? (
        //   <Card isHighlight>
        //     <Box transparent>
        //       {account && (
        //         <BoxItem>
        //           <BoxItemTitle light>Your Stake</BoxItemTitle>
        //           <Text light t2>
        //             {truncateBalance(cpUserStakeValue, 2)}
        //           </Text>
        //         </BoxItem>
        //       )}
        //       <BoxItem>
        //         <BoxItemTitle light>Total Assets</BoxItemTitle>
        //         <Text light t2>
        //           {truncateBalance(cpPoolValue, 2)}
        //         </Text>
        //       </BoxItem>
        //       <BoxItem>
        //         <BoxItemTitle light>ROI</BoxItemTitle>
        //         <Text light t2>
        //           {CP_ROI}
        //         </Text>
        //       </BoxItem>
        //       {account && (
        //         <>
        //           <BoxItem>
        //             <BoxItemTitle light>My Rewards</BoxItemTitle>
        //             <Text light t2>
        //               {truncateBalance(cpUserRewards, 2)}
        //             </Text>
        //           </BoxItem>
        //           <BoxItem>
        //             <BoxItemTitle light>My Daily Rewards</BoxItemTitle>
        //             <Text light t2>
        //               {truncateBalance(cpUserRewardsPerDay, 2)}
        //             </Text>
        //           </BoxItem>
        //         </>
        //       )}
        //       <BoxItem>
        //         <BoxItemTitle light>Daily Rewards</BoxItemTitle>
        //         <Text light t2>
        //           {truncateBalance(cpRewardsPerDay, 2)}
        //         </Text>
        //       </BoxItem>
        //     </Box>
        //     {account && (
        //       <ButtonWrapper>
        //         <Button
        //           widthP={100}
        //           disabled={errors.length > 0}
        //           onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit')}
        //           light
        //         >
        //           Deposit
        //         </Button>
        //         <Button
        //           widthP={100}
        //           disabled={errors.length > 0}
        //           onClick={() => openModal(FunctionName.WITHDRAW_CP, 'Withdraw')}
        //           light
        //         >
        //           Withdraw
        //         </Button>
        //         {/* <Button light widthP={100} disabled={errors.length > 0}>
        //           Claim Option
        //         </Button> */}
        //       </ButtonWrapper>
        //     )}
        //   </Card>

        // tablet version
        <Card isHighlight>
          {account && (
            <FormRow>
              <FormCol light>Your Stake:</FormCol>
              <FormCol light t2>
                {truncateBalance(cpUserStakeValue, 2)}
              </FormCol>
            </FormRow>
          )}
          <FormRow>
            <FormCol light>Total Assets:</FormCol>
            <FormCol light t2>
              {truncateBalance(cpPoolValue, 2)}
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol light>ROI:</FormCol>
            <FormCol light t2>
              {CP_ROI}
            </FormCol>
          </FormRow>
          {account && (
            <>
              <FormRow>
                <FormCol light>My Rewards:</FormCol>
                <FormCol light t2>
                  {truncateBalance(cpUserRewards, 2)}
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol light>My Daily Rewards:</FormCol>
                <FormCol light t2>
                  {truncateBalance(cpUserRewardsPerDay, 2)}
                </FormCol>
              </FormRow>
            </>
          )}
          <FormRow>
            <FormCol light>Daily Rewards:</FormCol>
            <FormCol light t2>
              {truncateBalance(cpRewardsPerDay, 2)}
            </FormCol>
          </FormRow>
          {account && (
            <ButtonWrapper isColumn={width <= BKPT_4}>
              <Button
                widthP={100}
                disabled={errors.length > 0}
                onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit')}
                light
              >
                Deposit
              </Button>
              <Button
                widthP={100}
                disabled={errors.length > 0}
                onClick={() => openModal(FunctionName.WITHDRAW_CP, 'Withdraw')}
                light
              >
                Withdraw
              </Button>
              {/* <Button light widthP={100} disabled={errors.length > 0}>
                Claim Option
              </Button> */}
            </ButtonWrapper>
          )}
        </Card>
      )}
    </Content>
  )
}
