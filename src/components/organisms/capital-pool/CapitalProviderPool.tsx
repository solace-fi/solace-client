/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    CapitalProviderPool
      hooks

  *************************************************************************************/

/* import packages */
import React, { useMemo } from 'react'

/* import managers */
import { useContracts } from '../../../context/ContractsManager'
import { useWallet } from '../../../context/WalletManager'
import { useGeneral } from '../../../context/GeneralProvider'

/* import components */
import { Content } from '../../atoms/Layout'
import { Text } from '../../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../../atoms/Table'
import { Button, ButtonWrapper } from '../../atoms/Button'
import { Card } from '../../atoms/Card'
import { FormRow, FormCol } from '../../atoms/Form'
import { HyperLink } from '../../atoms/Link'

/* import constants */
import { BKPT_4, BKPT_6 } from '../../../constants'
import { FunctionName } from '../../../constants/enums'

/* import hooks */
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../../hooks/useFarm'
import { useWindowDimensions } from '../../../hooks/useWindowDimensions'

/* import utils */
import { truncateBalance } from '../../../utils/formatting'

interface CapitalProviderPoolProps {
  openModal: (func: FunctionName, modalTitle: string, farmName: string) => void
}

export const CapitalProviderPool: React.FC<CapitalProviderPoolProps> = ({ openModal }) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { account } = useWallet()
  const { width } = useWindowDimensions()
  const { keyContracts } = useContracts()
  const { cpFarm } = useMemo(() => keyContracts, [keyContracts])
  const cpUserStakeValue = useUserStakedValue(cpFarm)
  const cpRewardsPerDay = useRewardsPerDay(1)
  const cpUserRewardsPerDay = useUserRewardsPerDay(1, cpFarm)
  const cpUserRewards = useUserPendingRewards(cpFarm)
  const cpPoolValue = usePoolStakedValue(cpFarm)

  return (
    <Content>
      <Text bold t1 mb={0} info>
        Options Farming Pool
      </Text>
      <Text t4 pt={10} pb={10}>
        This pool rewards coverage underwriters with $SOLACE token call options.
        <HyperLink
          t4
          href={'https://medium.com/solace-fi/solace-options-rewards-d4bd64902b4'}
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
              {account ? <TableHeader>My Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              <TableHeader>ROI (1Y)</TableHeader>
              {account ? <TableHeader>My Rewards</TableHeader> : null}
              {account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow light>
              {account ? <TableData t3>{truncateBalance(cpUserStakeValue, 2)}</TableData> : null}
              <TableData t3>{truncateBalance(cpPoolValue, 2)}</TableData>
              <TableData t3>N/A</TableData>
              {account ? <TableData t3>{truncateBalance(cpUserRewards, 2)}</TableData> : null}
              {account ? <TableData t3>{truncateBalance(cpUserRewardsPerDay, 2)}</TableData> : null}
              <TableData t3>{truncateBalance(cpRewardsPerDay, 2)}</TableData>
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200} style={{ float: 'right' }}>
                    <Button
                      light
                      disabled={haveErrors}
                      onClick={() => openModal(FunctionName.WITHDRAW_CP, 'Withdraw', 'cp')}
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
              N/A
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
                disabled={haveErrors}
                onClick={() => openModal(FunctionName.WITHDRAW_CP, 'Withdraw', 'cp')}
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
