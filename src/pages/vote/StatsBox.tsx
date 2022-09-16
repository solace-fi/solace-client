import React from 'react'
import { formatUnits } from 'ethers/lib/utils'
import { Flex } from '../../components/atoms/Layout'
import { TileCard } from '../../components/molecules/TileCard'
import { truncateValue } from '../../utils/formatting'
import { Text } from '../../components/atoms/Typography'
import { useAnalyticsContext } from '../analytics/AnalyticsContext'

export const StatsBox = () => {
  const { data } = useAnalyticsContext()
  const { uwpValueUSD } = data

  return (
    <TileCard gap={10}>
      <Flex between>
        <Text bold t4s>
          Underwriting Pool Size
        </Text>
        <Text bold t4s secondary>
          ${truncateValue(formatUnits(uwpValueUSD, 18), 2)}
        </Text>
      </Flex>
    </TileCard>
  )
}
