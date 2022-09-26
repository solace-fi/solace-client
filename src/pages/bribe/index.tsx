import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Content, Flex } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { TileCard } from '../../components/molecules/TileCard'
import { truncateValue } from '../../utils/formatting'
import { Button } from '../../components/atoms/Button'
import { useGaugeController } from '../../hooks/gauge/useGaugeController'
import { getDateStringWithMonthName, getTimeFromMillis, getTimesFromMillis } from '../../utils/time'
import { BribeList } from './components/BribesList'
import { useGeneral } from '../../context/GeneralManager'
import { BigNumber } from 'ethers'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useBribeController } from '../../hooks/bribe/useBribeController'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useNetwork } from '../../context/NetworkManager'
import BribeManager, { useBribeContext } from './BribeContext'
import { Card } from '../../components/atoms/Card'
import { StyledInfo } from '../../components/atoms/Icon'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from '../vote/VoteContext'

export default function Bribe(): JSX.Element {
  const { activeNetwork } = useNetwork()
  const canBribe = useMemo(() => activeNetwork.config.generalFeatures.native, [
    activeNetwork.config.generalFeatures.native,
  ])
  return (
    <>
      {canBribe ? (
        <BribeManager>
          <BribeContent />
        </BribeManager>
      ) : (
        <Content>
          <Card error pt={10} pb={10} pl={15} pr={15}>
            <Flex>
              <TextSpan light textAlignLeft>
                <StyledInfo size={30} />
              </TextSpan>
              <Text light bold autoAlign>
                Bribes are not available on this network.
              </Text>
            </Flex>
          </Card>
        </Content>
      )}
    </>
  )
}

export function BribeContent(): JSX.Element {
  const { appTheme } = useGeneral()
  const { getEpochEndTimestamp } = useGaugeController()
  const { claimBribes } = useBribeController()
  const { isSmallerMobile } = useWindowDimensions()
  const { bribes } = useBribeContext()
  const { claimableBribes, bribeTokens } = bribes
  const { handleContractCallError, handleToast } = useTransactionExecution()
  const { voteGeneral, voteOwner } = useVoteContext()
  const { isVotingOpen } = voteGeneral
  const { votesData } = voteOwner

  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [epochEndTimestamp, setEpochEndTimestamp] = useState<BigNumber | undefined>(undefined)

  const [isBribeChaser, setIsBribeChaser] = useState<boolean>(true)

  const claimableUSD = useMemo(() => {
    let totalUSD = 0
    for (let i = 0; i < claimableBribes.length; i++) {
      const bribe = claimableBribes[i]
      const token = bribeTokens.find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())
      if (token) {
        totalUSD += token.price * parseFloat(formatUnits(bribe.bribeAmount, token.decimals))
      }
    }
    return totalUSD
  }, [bribeTokens, claimableBribes])

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
                <Text t2 bold>
                  {truncateValue(formatUnits(votesData.votePower, 18), 2)}
                </Text>
              </Flex>
            </Flex>
          </TileCard>
          <TileCard bgSecondary style={{ width: isSmallerMobile ? '100%' : undefined }}>
            <Flex col gap={25}>
              <Flex col itemsCenter gap={8}>
                <Text bold t6s>
                  Total Rewards
                </Text>
                <Text t3s bold>
                  ${truncateValue(claimableUSD, 2)}
                </Text>
              </Flex>
              <Button info onClick={callClaim} disabled={claimableUSD == 0}>
                Claim
              </Button>
            </Flex>
          </TileCard>
        </Flex>
        <TileCard bgSecondary>
          <Flex col itemsCenter gap={16}>
            <Text bold t6s>
              {epochEndTimestamp &&
                `Epoch ends ${getDateStringWithMonthName(new Date(epochEndTimestamp.toNumber() * 1000))}`}
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
