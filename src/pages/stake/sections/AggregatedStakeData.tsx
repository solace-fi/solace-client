import React from 'react'
import Flex from '../atoms/Flex'
import RaisedBox from '../atoms/RaisedBox'
import CardSectionValue from '../components/CardSectionValue'
import { Separator } from '../components/VerticalSeparator'
import InfoPair from '../molecules/InfoPair'
import { Text } from '../../../components/atoms/Typography'
import { UserLocksInfo } from '../../../constants/types'
import { truncateValue } from '../../../utils/formatting'
import { formatUnits } from '@ethersproject/units'
import { useWindowDimensions } from '../../../hooks/useWindowDimensions'
import { BKPT_6 } from '../../../constants'

export default function AggregatedStakeData({ stakeData }: { stakeData: UserLocksInfo }): JSX.Element {
  const { width } = useWindowDimensions()
  return (
    <RaisedBox>
      <Flex col={width < BKPT_6} stretch gap={BKPT_6 > width ? 20 : 91} wrap mb={20} p={24}>
        {/* unstaked, staked, locked, total rewards, separator, apy (secondary) */}
        {/* <InfoPair importance="primary" label="Unstaked Balance">
          <CardSectionValue annotation="SOLACE">{truncateValue(solaceBalance, 2)}</CardSectionValue>
        </InfoPair> */}
        <Flex
          gap={BKPT_6 > width ? 20 : 91}
          style={
            BKPT_6 > width
              ? { alignSelf: 'start', margin: 'auto', width: '300px', display: 'flex', justifyContent: 'space-between' }
              : {}
          }
        >
          <div style={BKPT_6 > width ? { width: '140px' } : {}}>
            <InfoPair importance="primary" label="Staked Balance">
              <CardSectionValue annotation="SOLACE">
                {truncateValue(formatUnits(stakeData.stakedBalance, 18), 2)}
              </CardSectionValue>
            </InfoPair>
          </div>
          <div style={BKPT_6 > width ? { width: '140px' } : {}}>
            <InfoPair importance="primary" label="Unlocked Balance">
              <CardSectionValue annotation="SOLACE">
                {truncateValue(formatUnits(stakeData.unlockedBalance, 18), 2)}
              </CardSectionValue>
            </InfoPair>
          </div>
        </Flex>
        <Flex
          gap={BKPT_6 > width ? 20 : 91}
          style={
            BKPT_6 > width
              ? { alignSelf: 'start', margin: 'auto', width: '300px', display: 'flex', justifyContent: 'space-between' }
              : {}
          }
        >
          <div style={BKPT_6 > width ? { width: '140px' } : {}}>
            <InfoPair importance="primary" label="Locked Balance">
              <CardSectionValue annotation="SOLACE">
                {truncateValue(formatUnits(stakeData.lockedBalance, 18), 2)}
              </CardSectionValue>
            </InfoPair>
          </div>
          <div style={BKPT_6 > width ? { width: '140px' } : {}}>
            <InfoPair importance="primary" label="Total Rewards">
              <CardSectionValue annotation="SOLACE">
                {truncateValue(formatUnits(stakeData.pendingRewards, 18), 2)}
              </CardSectionValue>
            </InfoPair>
          </div>
        </Flex>
        <Flex col={BKPT_6 > width} gap={BKPT_6 > width ? 20 : 91} stretch>
          <Separator horizontal={BKPT_6 > width} />
          <div
            style={
              BKPT_6 > width
                ? {
                    alignSelf: 'center',
                    width: '300px',
                    display: 'flex',
                    justifyContent: 'center',
                  }
                : {}
            }
          >
            <InfoPair importance="secondary" label="APY" horizontal={BKPT_6 > width}>
              <Text bold style={{ fontSize: '16px' }}>
                {stakeData.apy.toNumber()}%
              </Text>
            </InfoPair>
          </div>
        </Flex>
      </Flex>
    </RaisedBox>
  )
}
