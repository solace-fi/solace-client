import React, { useMemo } from 'react'
import { isAddress } from 'ethers/lib/utils'
import { Accordion } from '../../components/atoms/Accordion'
import { Button } from '../../components/atoms/Button'
import { Flex, ShadowDiv, VerticalSeparator } from '../../components/atoms/Layout'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { DelegatorVoteGauge } from './organisms/DelegatorVoteGauge'
import { useUwpLockVoting } from '../../hooks/lock/useUwpLockVoting'
import { useVoteContext } from './VoteContext'
import { Text } from '../../components/atoms/Typography'

export const DelegatorVoteTab = () => {
  const { gauges, voteGeneral, voteDelegator } = useVoteContext()
  const { isVotingOpen, addEmptyVote } = voteGeneral
  const { gaugesData } = gauges
  const { delegatorVotesData, delegator, handleDelegatorAddress } = voteDelegator

  const { voteMultiple, removeVoteMultiple } = useUwpLockVoting()

  const areAllGaugesActive_Delegator = useMemo(() => {
    delegatorVotesData.voteAllocation.filter((g) => !g.gaugeActive).length === 0
  }, [delegatorVotesData.voteAllocation])

  return (
    <>
      <Flex>
        <Flex col widthP={100} gap={5}>
          <Text t4s textAlignCenter>
            If a user has chosen you as their delegate, you may vote for them with their vote points.
          </Text>
          <SmallerInputSection
            placeholder={`Query a Delegator's Address`}
            value={delegator}
            onChange={(e) => handleDelegatorAddress(e.target.value)}
          />
        </Flex>
      </Flex>
      <Flex col itemsCenter gap={15}>
        <ShadowDiv>
          <Flex gap={12} p={10}>
            <Flex col itemsCenter width={126}>
              <Text techygradient t6s>
                Delegator&apos;s Total Points
              </Text>
              <Text techygradient big3>
                239
              </Text>
            </Flex>
            <VerticalSeparator />
            <Flex col itemsCenter width={126}>
              <Text t6s>Delegator&apos;s Used Points</Text>
              <Text big3>239</Text>
            </Flex>
          </Flex>
        </ShadowDiv>
        <Accordion isOpen={delegatorVotesData.voteAllocation.length > 0} thinScrollbar>
          <Flex col gap={10} p={10}>
            {delegatorVotesData.voteAllocation.map((voteData, i) => (
              <DelegatorVoteGauge key={i} delegator={delegator} index={i} />
            ))}
          </Flex>
        </Accordion>
        {isVotingOpen ? (
          <>
            <Button onClick={() => addEmptyVote(false)}>+ Add Gauge Vote</Button>
            <Button
              techygradient
              secondary
              noborder
              widthP={100}
              onClick={() => {
                if (!delegator || !isAddress(delegator)) return
                voteMultiple(
                  delegator,
                  gaugesData.map((item) => item.gaugeId),
                  gaugesData.map((item) => item.gaugeWeight)
                )
              }}
            >
              Set Votes
            </Button>
            <Button
              error
              widthP={100}
              onClick={() => {
                if (!delegator || !isAddress(delegator)) return
                removeVoteMultiple(
                  delegator,
                  gaugesData.map((item) => item.gaugeId)
                )
              }}
            >
              Remove all votes
            </Button>
          </>
        ) : (
          <Text>Voting is closed</Text>
        )}
      </Flex>
    </>
  )
}
