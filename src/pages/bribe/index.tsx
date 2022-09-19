import React, { useEffect, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import ToggleSwitch from '../../components/atoms/ToggleSwitch'
import { TileCard } from '../../components/molecules/TileCard'
import { truncateValue } from '../../utils/formatting'
import { Button } from '../../components/atoms/Button'
import { useProvider } from '../../context/ProviderManager'
import { useGaugeController } from '../../hooks/gauge/useGaugeController'
import { getTimesFromMillis } from '../../utils/time'
import { BribeList } from './components/BribesList'

export default function Bribe(): JSX.Element {
  return <BribeContent />
}

export function BribeContent(): JSX.Element {
  const [isBribeChaser, setIsBribeChaser] = useState<boolean>(false)

  const { latestBlock } = useProvider()
  const { getEpochEndTimestamp } = useGaugeController()

  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const getTimes = async () => {
      if (!latestBlock) return
      const endTime = await getEpochEndTimestamp()
      const blockTime = latestBlock.timestamp

      setRemainingTime(getTimesFromMillis(endTime.toNumber() * 1000 - blockTime * 1000))
    }
    getTimes()
  }, [latestBlock, getEpochEndTimestamp])

  return (
    <Flex col gap={16}>
      <Flex wrapped gap={16}>
        <TileCard bgSecondary>
          <Flex col gap={16}>
            <Flex col itemsCenter gap={8}>
              <Text bold t6s>
                Mode
              </Text>
              <Text t3s bold info>
                {isBribeChaser ? 'Bribe Chaser' : 'Bribe Provider'}
              </Text>
            </Flex>
            <Flex col itemsCenter>
              <ToggleSwitch
                id="bribe-chaser"
                toggled={isBribeChaser}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsBribeChaser(e.target.checked)}
                height={31}
                width={58}
                buttonSize={31}
              />
            </Flex>
          </Flex>
        </TileCard>
        <TileCard bgSecondary>
          <Flex col gap={25}>
            <Flex col itemsCenter gap={8}>
              <Text bold t6s>
                Available Votes
              </Text>
              <Text t3s bold>
                420
              </Text>
            </Flex>
            <Text t3s bold success>
              Voting Open
            </Text>
          </Flex>
        </TileCard>
        <TileCard bgSecondary>
          <Flex col gap={25}>
            <Flex col itemsCenter gap={8}>
              <Text bold t6s>
                Total Rewards
              </Text>
              <Text t3s bold>
                $420
              </Text>
            </Flex>
            <Button info>Claim</Button>
          </Flex>
        </TileCard>
        <TileCard bgSecondary>
          <Flex col itemsCenter gap={16}>
            <Text bold t6s>
              Remaining Time
            </Text>
            <Flex gap={8}>
              <TileCard padding={8}>
                <Text t3s bold textAlignCenter>
                  {remainingTime.days}
                </Text>
                <Text t7s textAlignCenter>
                  Days
                </Text>
              </TileCard>
              <TileCard padding={8}>
                <Text t3s bold textAlignCenter>
                  {remainingTime.hours}
                </Text>
                <Text t7s textAlignCenter>
                  Hrs
                </Text>
              </TileCard>
              <TileCard padding={8}>
                <Text t3s bold textAlignCenter>
                  {remainingTime.minutes}
                </Text>
                <Text t7s textAlignCenter>
                  Mins
                </Text>
              </TileCard>
              <TileCard padding={8}>
                <Text t3s bold textAlignCenter>
                  {remainingTime.seconds}
                </Text>
                <Text t7s textAlignCenter>
                  Secs
                </Text>
              </TileCard>
            </Flex>
          </Flex>
        </TileCard>
      </Flex>
      <BribeList />
    </Flex>
  )
}
