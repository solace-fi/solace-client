import React, { useEffect, useState } from 'react'
import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { Flex } from '../../components/atoms/Layout'
import { TileCard } from '../../components/molecules/TileCard'
import { useUwp } from '../../hooks/lock/useUnderwritingHelper'
import { truncateValue } from '../../utils/formatting'
import { Text } from '../../components/atoms/Typography'
import { useNetwork } from '../../context/NetworkManager'

export const StatsBox = () => {
  const [uwpValueUSD, setUwpValueUSD] = useState<BigNumber>(ZERO)
  const { valueOfPool } = useUwp()
  const { activeNetwork } = useNetwork()

  useEffect(() => {
    const init = async () => {
      const _valueOfPool = await valueOfPool()
      setUwpValueUSD(_valueOfPool)
    }
    init()
  }, [activeNetwork])

  return (
    <TileCard gap={10}>
      <Flex between>
        <Text bold t5s>
          Underwriting Pool Size
        </Text>
        <Text bold t5s secondary>
          ${truncateValue(formatUnits(uwpValueUSD, 18), 2)}
        </Text>
      </Flex>
    </TileCard>
  )
}
