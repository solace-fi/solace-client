import React from 'react'
import Flex from '../atoms/Flex'
import RaisedBox from '../atoms/RaisedBox'
import CardSectionValue from '../components/CardSectionValue'
import VerticalSeparator from '../components/VerticalSeparator'
import InfoPair from '../molecules/InfoPair'
import { Text } from '../../../components/atoms/Typography'

const stakedSolaceBalance = 100
const unlockedSolaceBalance = 550
const lockedSolaceBalance = 13271.5

export default function AggregatedStakeData(): JSX.Element {
  return (
    <RaisedBox>
      <Flex stretch gap={91} wrap mb={20} p={24}>
        {/* unstaked, staked, locked, total rewards, separator, apy (secondary) */}
        <InfoPair importance="primary" label="Unstaked Balance">
          <CardSectionValue annotation="SOLACE">{stakedSolaceBalance}</CardSectionValue>
        </InfoPair>
        <InfoPair importance="primary" label="Staked Balance">
          <CardSectionValue annotation="SOLACE">{unlockedSolaceBalance}</CardSectionValue>
        </InfoPair>
        <InfoPair importance="primary" label="Locked Balance">
          <CardSectionValue annotation="SOLACE">{lockedSolaceBalance}</CardSectionValue>
        </InfoPair>
        <InfoPair importance="primary" label="Total Rewards">
          <CardSectionValue annotation="SOLACE">{stakedSolaceBalance}</CardSectionValue>
        </InfoPair>
        <VerticalSeparator />
        <InfoPair importance="secondary" label="APY">
          <Text bold>2000%</Text>
        </InfoPair>
      </Flex>
    </RaisedBox>
  )
}
