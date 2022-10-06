import React from 'react'
import { Flex } from '../../../components/atoms/Layout'
import { RaisedBox } from '../../../components/atoms/Box'
import CardSectionValue from '../components/CardSectionValue'
import InfoPair from '../molecules/InfoPair'
import { Text } from '../../../components/atoms/Typography'
import { truncateValue } from '../../../utils/formatting'
import { formatUnits } from '@ethersproject/units'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { BKPT_6, BKPT_7 } from '../../../constants'
import { Card } from '../../../components/atoms/Card'
import { useGeneral } from '../../../context/GeneralManager'
import { UserVoteLocksInfo } from '../../../constants/types'

export default function AggregatedStakeData({ stakeData }: { stakeData: UserVoteLocksInfo }): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  return (
    <>
      {width > (rightSidebar ? BKPT_7 : BKPT_6) ? (
        <RaisedBox>
          <Flex stretch gap={91} wrapped mb={20} p={24} justifyCenter>
            <Flex gap={91}>
              <div>
                <InfoPair importance="primary" label="Staked Balance">
                  <CardSectionValue annotation="UWE">
                    {truncateValue(formatUnits(stakeData.stakedBalance, 18), 2)}
                  </CardSectionValue>
                </InfoPair>
              </div>
            </Flex>
          </Flex>
        </RaisedBox>
      ) : (
        <Card>
          <Flex stretch between mb={24}>
            <Text info bold>
              Staked Balance
            </Text>
            <Text t2 nowrap bold>
              {/* {truncateValue(formatUnits(stakeData.stakedBalance, 18), 2)} UWE */}
              <CardSectionValue annotation="UWE">
                {truncateValue(formatUnits(stakeData.stakedBalance, 18), 2)}
              </CardSectionValue>
            </Text>
          </Flex>
        </Card>
      )}
    </>
  )
}
