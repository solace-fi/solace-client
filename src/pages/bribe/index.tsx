import React, { useCallback, useEffect, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { truncateValue } from '../../utils/formatting'
import { Button } from '../../components/atoms/Button'
import { useGaugeController } from '../../hooks/gauge/useGaugeController'
import { getTimesFromMillis } from '../../utils/time'
import { BribeList } from './components/BribesList'
import { useGeneral } from '../../context/GeneralManager'
import { BigNumber } from 'ethers'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useBribeController } from '../../hooks/bribe/useBribeController'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'

export default function Bribe(): JSX.Element {
  return <BribeContent />
}

export function BribeContent(): JSX.Element {
  const { appTheme } = useGeneral()
  const [isBribeChaser, setIsBribeChaser] = useState<boolean>(true)

  const { getEpochEndTimestamp } = useGaugeController()
  const { claimBribes } = useBribeController()
  const { isSmallerMobile } = useWindowDimensions()
  const { handleContractCallError, handleToast } = useTransactionExecution()

  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [epochEndTimestamp, setEpochEndTimestamp] = useState<BigNumber | undefined>(undefined)

  const callClaim = useCallback(async () => {
    await claimBribes()
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callClaim', err, FunctionName.BRIBE_CLAIM))
  }, [claimBribes])

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
  }, [epochEndTimestamp])

  return (
    <Flex col gap={16}>
      <Flex
        bgSecondary
        style={{
          gridTemplateColumns: '1fr 1fr',
          display: 'grid',
          position: 'relative',
          borderRadius: '16px',
          padding: '8px',
          gap: '8px',
        }}
      >
        <TileCard
          padding={8}
          noShadow
          onClick={() => setIsBribeChaser(true)}
          style={{
            cursor: 'pointer',
            borderRadius: '12px',
          }}
          bgSecondary={!isBribeChaser}
          bgTechy={isBribeChaser && appTheme == 'light'}
          bgWarm={isBribeChaser && appTheme == 'dark'}
        >
          <Text textAlignCenter t5s bold light={isBribeChaser}>
            Chase Bribe
          </Text>
        </TileCard>
        <TileCard
          padding={8}
          noShadow
          onClick={() => setIsBribeChaser(false)}
          style={{
            cursor: 'pointer',
            borderRadius: '12px',
          }}
          bgSecondary={isBribeChaser}
          bgTechy={!isBribeChaser && appTheme == 'light'}
          bgWarm={!isBribeChaser && appTheme == 'dark'}
        >
          <Text textAlignCenter t5s bold light={!isBribeChaser}>
            Provide Bribe
          </Text>
        </TileCard>
      </Flex>
      <Flex col={isSmallerMobile} gap={16}>
        <Flex gap={16}>
          <TileCard bgSecondary style={{ width: isSmallerMobile ? '100%' : undefined }}>
            <Flex col gap={25}>
              <Flex col itemsCenter gap={8}>
                <Text bold t6s>
                  Available Votes
                </Text>
                <Text t3s bold>
                  420
                </Text>
              </Flex>
              <Text t3s bold success textAlignCenter>
                Voting Open
              </Text>
            </Flex>
          </TileCard>
          <TileCard bgSecondary style={{ width: isSmallerMobile ? '100%' : undefined }}>
            <Flex col gap={25}>
              <Flex col itemsCenter gap={8}>
                <Text bold t6s>
                  Total Rewards
                </Text>
                <Text t3s bold>
                  $420
                </Text>
              </Flex>
              <Button info onClick={callClaim}>
                Claim
              </Button>
            </Flex>
          </TileCard>
        </Flex>
        <TileCard bgSecondary>
          <Flex col itemsCenter gap={16}>
            <Text bold t6s>
              Remaining Epoch Time
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
      <BribeList isBribeChaser={isBribeChaser} />
    </Flex>
  )
}
