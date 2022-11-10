import React from 'react'
import { formatUnits } from 'ethers/lib/utils'
import { Flex } from '../../components/atoms/Layout'
import { TileCard } from '../../components/molecules/TileCard'
import { truncateValue } from '../../utils/formatting'
import { Text } from '../../components/atoms/Typography'
import { useAnalyticsContext } from '../analytics/AnalyticsContext'
import { useVoteContext } from './VoteContext'

export const StatsBox = () => {
  const { data } = useAnalyticsContext()
  const { uwpValueUSD } = data

  const { gauges } = useVoteContext()
  const { currentGaugesData, insuranceCapacity } = gauges

  return (
    <TileCard gap={10}>
      <Flex between>
        <Text bold t3s>
          Underwriting Pool Size
        </Text>
        <Text bold t3s secondary>
          ${truncateValue(formatUnits(uwpValueUSD, 18), 2)}
        </Text>
      </Flex>
      <Flex between>
        <Text bold t3s>
          Insurance Capacity
        </Text>
        <Text bold t3s secondary>
          ${truncateValue(insuranceCapacity, 2)}
        </Text>
      </Flex>
      <Flex between>
        <Text bold t3s>
          Number of Gauges
        </Text>
        <Text bold t3s secondary>
          {currentGaugesData.length}
        </Text>
      </Flex>
    </TileCard>
  )
}
