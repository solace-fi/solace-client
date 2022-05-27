import React from 'react'
import { Flex, Separator } from '../../../components/atoms/Layout'
import { RaisedBox } from '../../../components/atoms/Box'
import CardSectionValue from '../components/CardSectionValue'
import InfoPair from '../molecules/InfoPair'
import { Text } from '../../../components/atoms/Typography'
import { UserLocksInfo } from '@solace-fi/sdk-nightly'
import { truncateValue } from '../../../utils/formatting'
import { formatUnits } from '@ethersproject/units'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { BKPT_6, BKPT_7 } from '../../../constants'
import { Card } from '../../../components/atoms/Card'
import { useGeneral } from '../../../context/GeneralManager'

export default function AggregatedStakeData({ stakeData }: { stakeData: UserLocksInfo }): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  return (
    <>
      {width > (rightSidebar ? BKPT_7 : BKPT_6) ? (
        <RaisedBox>
          <Flex stretch gap={91} wrap mb={20} p={24}>
            <Flex gap={91}>
              <div>
                <InfoPair importance="primary" label="Staked Balance">
                  <CardSectionValue annotation="SOLACE">
                    {truncateValue(formatUnits(stakeData.stakedBalance, 18), 2)}
                  </CardSectionValue>
                </InfoPair>
              </div>
              <div>
                <InfoPair importance="primary" label="Unlocked Balance">
                  <CardSectionValue annotation="SOLACE">
                    {truncateValue(formatUnits(stakeData.unlockedBalance, 18), 2)}
                  </CardSectionValue>
                </InfoPair>
              </div>
            </Flex>
            <Flex gap={91}>
              <div>
                <InfoPair importance="primary" label="Locked Balance">
                  <CardSectionValue annotation="SOLACE">
                    {truncateValue(formatUnits(stakeData.lockedBalance, 18), 2)}
                  </CardSectionValue>
                </InfoPair>
              </div>
              <div>
                <InfoPair importance="primary" label="Total Rewards">
                  <CardSectionValue annotation="SOLACE">
                    {truncateValue(formatUnits(stakeData.pendingRewards, 18), 2)}
                  </CardSectionValue>
                </InfoPair>
              </div>
            </Flex>
            <Flex col={(rightSidebar ? BKPT_7 : BKPT_6) > width} gap={91} stretch>
              <Separator horizontal={(rightSidebar ? BKPT_7 : BKPT_6) > width} />
              <div>
                <InfoPair importance="secondary" label="APR" horizontal={(rightSidebar ? BKPT_7 : BKPT_6) > width}>
                  <Text bold style={{ fontSize: '16px' }}>
                    {truncateValue(stakeData.apr.toString(), 1)}%
                  </Text>
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
              {truncateValue(formatUnits(stakeData.stakedBalance, 18), 2)} SOLACE
            </Text>
          </Flex>
          <Flex stretch between mb={24}>
            <Text info bold>
              Unlocked Balance
            </Text>
            <Text t2 nowrap bold>
              {truncateValue(formatUnits(stakeData.unlockedBalance, 18), 2)} SOLACE
            </Text>
          </Flex>
          <Flex stretch between mb={24}>
            <Text info bold>
              Locked Balance
            </Text>
            <Text t2 nowrap bold>
              {truncateValue(formatUnits(stakeData.lockedBalance, 18), 2)} SOLACE
            </Text>
          </Flex>
          <Flex stretch between mb={24}>
            <Text info bold>
              Total Rewards
            </Text>
            <Text t2 nowrap bold>
              {truncateValue(formatUnits(stakeData.pendingRewards, 18), 2)} SOLACE
            </Text>
          </Flex>
          <Flex stretch between mb={24}>
            <Text>APR</Text>
            <Text t2 nowrap bold>
              {truncateValue(stakeData.apr.toString(), 1)}%
            </Text>
          </Flex>
        </Card>
      )}
    </>
  )
}
