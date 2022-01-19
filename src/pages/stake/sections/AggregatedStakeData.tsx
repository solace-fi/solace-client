import React from 'react'
import Flex from '../atoms/Flex'
import RaisedBox from '../atoms/RaisedBox'
import CardSectionValue from '../components/CardSectionValue'
import VerticalSeparator from '../components/VerticalSeparator'
import InfoPair from '../molecules/InfoPair'
import { Text } from '../../../components/atoms/Typography'
import { UserLocksInfo } from '../../../constants/types'
import { truncateValue } from '../../../utils/formatting'
import { formatUnits } from '@ethersproject/units'

export default function AggregatedStakeData({ stakeData }: { stakeData: UserLocksInfo }): JSX.Element {
  return (
    <RaisedBox>
      <Flex stretch gap={91} wrap mb={20} p={24}>
        {/* unstaked, staked, locked, total rewards, separator, apy (secondary) */}
        {/* <InfoPair importance="primary" label="Unstaked Balance">
          <CardSectionValue annotation="SOLACE">{truncateValue(solaceBalance, 2)}</CardSectionValue>
        </InfoPair> */}
        <InfoPair importance="primary" label="Staked Balance">
          <CardSectionValue annotation="SOLACE">
            {truncateValue(formatUnits(stakeData.stakedBalance, 18), 2)}
          </CardSectionValue>
        </InfoPair>
        <InfoPair importance="primary" label="Unlocked Balance">
          <CardSectionValue annotation="SOLACE">
            {truncateValue(formatUnits(stakeData.unlockedBalance, 18), 2)}
          </CardSectionValue>
        </InfoPair>
        <InfoPair importance="primary" label="Locked Balance">
          <CardSectionValue annotation="SOLACE">
            {truncateValue(formatUnits(stakeData.lockedBalance, 18), 2)}
          </CardSectionValue>
        </InfoPair>
        <InfoPair importance="primary" label="Total Rewards">
          <CardSectionValue annotation="SOLACE">
            {truncateValue(formatUnits(stakeData.pendingRewards, 18), 2)}
          </CardSectionValue>
        </InfoPair>
        <VerticalSeparator />
        <InfoPair importance="secondary" label="APY">
          <Text bold>{stakeData.apy.toNumber()}%</Text>
        </InfoPair>
      </Flex>
    </RaisedBox>
  )
}
