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
import { FormRow, FormCol } from '../../../components/atoms/Form'
import { Card } from '../../../components/atoms/Card'

export default function AggregatedStakeData({ stakeData }: { stakeData: UserLocksInfo }): JSX.Element {
  const { width } = useWindowDimensions()
  return (
    <>
      {width > BKPT_6 ? (
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
            <Flex col={BKPT_6 > width} gap={91} stretch>
              <Separator horizontal={BKPT_6 > width} />
              <div>
                <InfoPair importance="secondary" label="APY" horizontal={BKPT_6 > width}>
                  <Text bold style={{ fontSize: '16px' }}>
                    {truncateValue(stakeData.apy.toString(), 1)}%
                  </Text>
                </InfoPair>
              </div>
            </Flex>
          </Flex>
        </RaisedBox>
      ) : (
        <Card>
          <FormRow>
            <FormCol info bold>
              Staked Balance
            </FormCol>
            <FormCol>
              <Text t2 nowrap bold>
                {truncateValue(formatUnits(stakeData.stakedBalance, 18), 2)} SOLACE
              </Text>
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol info bold>
              Unlocked Balance
            </FormCol>
            <FormCol>
              <Text t2 nowrap bold>
                {truncateValue(formatUnits(stakeData.unlockedBalance, 18), 2)} SOLACE
              </Text>
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol info bold>
              Locked Balance
            </FormCol>
            <FormCol>
              <Text t2 nowrap bold>
                {truncateValue(formatUnits(stakeData.lockedBalance, 18), 2)} SOLACE
              </Text>
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol info bold>
              Total Rewards
            </FormCol>
            <FormCol>
              <Text t2 nowrap bold>
                {truncateValue(formatUnits(stakeData.pendingRewards, 18), 2)} SOLACE
              </Text>
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol>APY</FormCol>
            <FormCol>
              <Text t2 nowrap bold>
                {truncateValue(stakeData.apy.toString(), 1)}%
              </Text>
            </FormCol>
          </FormRow>
        </Card>
      )}
    </>
  )
}
