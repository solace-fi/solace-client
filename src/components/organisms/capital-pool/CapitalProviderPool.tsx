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
import { useGeneral } from '../../../context/GeneralManager'

/* import components */
import { Content } from '../../atoms/Layout'
import { Text } from '../../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../../atoms/Table'
import { Button, ButtonWrapper } from '../../atoms/Button'
import { Card } from '../../atoms/Card'
import { Flex } from '../../atoms/Layout'
import { HyperLink } from '../../atoms/Link'

/* import constants */
import { BKPT_4, BKPT_6 } from '../../../constants'
import { FunctionName } from '../../../constants/enums'

/* import hooks */
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../../hooks/_legacy/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../../hooks/_legacy/useFarm'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'

/* import utils */
import { truncateValue } from '../../../utils/formatting'

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
      <Text bold t1 mb={0} warning>
        V1 Options Farming Pool
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
              {account ? <TableData t3>{truncateValue(cpUserStakeValue, 2)}</TableData> : null}
              <TableData t3>{truncateValue(cpPoolValue, 2)}</TableData>
              <TableData t3>N/A</TableData>
              {account ? <TableData t3>{truncateValue(cpUserRewards, 2)}</TableData> : null}
              {account ? <TableData t3>{truncateValue(cpUserRewardsPerDay, 2)}</TableData> : null}
              <TableData t3>{truncateValue(cpRewardsPerDay, 2)}</TableData>
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
            <Flex stretch between mb={24}>
              <Text light>My Stake:</Text>
              <Text light t2>
                {truncateValue(cpUserStakeValue, 2)}
              </Text>
            </Flex>
          )}
          <Flex stretch between mb={24}>
            <Text light>Total Assets:</Text>
            <Text light t2>
              {truncateValue(cpPoolValue, 2)}
            </Text>
          </Flex>
          <Flex stretch between mb={24}>
            <Text light>ROI:</Text>
            <Text light t2>
              N/A
            </Text>
          </Flex>
          {account && (
            <>
              <Flex stretch between mb={24}>
                <Text light>My Rewards:</Text>
                <Text light t2>
                  {truncateValue(cpUserRewards, 2)}
                </Text>
              </Flex>
              <Flex stretch between mb={24}>
                <Text light>My Daily Rewards:</Text>
                <Text light t2>
                  {truncateValue(cpUserRewardsPerDay, 2)}
                </Text>
              </Flex>
            </>
          )}
          <Flex stretch between mb={24}>
            <Text light>Daily Rewards:</Text>
            <Text light t2>
              {truncateValue(cpRewardsPerDay, 2)}
            </Text>
          </Flex>
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
