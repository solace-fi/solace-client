import React, { useEffect, useState } from 'react'
import { Flex } from '../../../components/atoms/Layout'
import { useProvider } from '../../../context/ProviderManager'
import { useGaugeController } from '../../../hooks/gauge/useGaugeController'
import { getTimeFromMillis } from '../../../utils/time'
import { Text } from '../../../components/atoms/Typography'

export const EpochTimer = () => {
  const { latestBlock } = useProvider()
  const { getEpochEndTimestamp } = useGaugeController()

  const [remainingTime, setRemainingTime] = useState('')

  useEffect(() => {
    const getTimes = async () => {
      if (!latestBlock) return
      const endTime = await getEpochEndTimestamp()
      const blockTime = latestBlock.timestamp

      setRemainingTime(getTimeFromMillis(endTime.toNumber() * 1000 - blockTime * 1000))
    }
    getTimes()
  }, [latestBlock, getEpochEndTimestamp])

  return (
    <Flex col gap={5}>
      <Text t4s textAlignCenter>
        Time until voting closes
      </Text>
      <Text t2 textAlignCenter info>
        {remainingTime}
      </Text>
    </Flex>
  )
}
