import { useEffect, useState } from 'react'
import { useGaugeController } from '../gauge/useGaugeController'
import { getTimesFromMillis } from '../../utils/time'
import { BigNumber } from 'ethers'

export const useEpochTimer = () => {
  const { getEpochEndTimestamp } = useGaugeController()

  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [epochEndTimestamp, setEpochEndTimestamp] = useState<BigNumber | undefined>(undefined)

  useEffect(() => {
    const init = async () => {
      if (remainingTime.days + remainingTime.hours + remainingTime.minutes + remainingTime.seconds === 0) {
        const endTime = await getEpochEndTimestamp()
        setEpochEndTimestamp(endTime)
      }
    }
    init()
  }, [getEpochEndTimestamp, remainingTime])

  useEffect(() => {
    const getTimes = () => {
      if (!epochEndTimestamp || epochEndTimestamp.isZero()) return
      setInterval(() => {
        const times = getTimesFromMillis(epochEndTimestamp.toNumber() * 1000 - Date.now())
        setRemainingTime(times)
      }, 1000)
    }
    getTimes()
  }, [getEpochEndTimestamp, epochEndTimestamp])

  return { remainingTime, epochEndTimestamp }
}
