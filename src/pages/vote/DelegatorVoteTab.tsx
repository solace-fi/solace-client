import React, { useCallback, useMemo } from 'react'
import { isAddress } from 'ethers/lib/utils'
import { Accordion } from '../../components/atoms/Accordion'
import { Button } from '../../components/atoms/Button'
import { Flex, ShadowDiv, VerticalSeparator } from '../../components/atoms/Layout'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { DelegatorVoteGauge } from './organisms/DelegatorVoteGauge'
import { useUwLockVoting } from '../../hooks/lock/useUwLockVoting'
import { useVoteContext } from './VoteContext'
import { Text } from '../../components/atoms/Typography'
import { BigNumber } from '@solace-fi/sdk-nightly'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { formatAmount } from '../../utils/formatting'

export const DelegatorVoteTab = () => {
  const { voteGeneral, voteDelegator } = useVoteContext()
  const { isVotingOpen, addEmptyVote } = voteGeneral
  const { delegatorVotesData, delegator, handleDelegatorAddress } = voteDelegator

  const { voteMultiple, removeVoteMultiple } = useUwLockVoting()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  /** cannot call vote multiple if any gauges of changed or added votes 
      are inactive and the allocated vote power is not zero
  */
  const cannotCallVoteMultiple = useMemo(
    () =>
      delegatorVotesData.localVoteAllocation.filter((g) => {
        return (
          !g.gaugeActive &&
          !BigNumber.from(Math.floor(parseFloat(formatAmount(g.votePowerPercentage)) * 100)).isZero() &&
          (g.changed || g.added)
        )
      }).length > 0,
    [delegatorVotesData.localVoteAllocation]
  )

  const callVoteMultiple = useCallback(async () => {
    if (cannotCallVoteMultiple) return
    if (!isVotingOpen) return
    if (!delegator || !isAddress(delegator)) return
    const queuedVotes = delegatorVotesData.localVoteAllocation.filter((g) => g.changed || g.added)
    await voteMultiple(
      delegator,
      queuedVotes.map((g) => g.gaugeId),
      queuedVotes.map((g) => BigNumber.from(Math.floor(parseFloat(formatAmount(g.votePowerPercentage)) * 100)))
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVoteMultiple', err, FunctionName.VOTE_MULTIPLE))
  }, [delegator, cannotCallVoteMultiple, isVotingOpen, delegatorVotesData.localVoteAllocation])

  const callRemoveVoteMultiple = useCallback(async () => {
    if (!isVotingOpen) return
    if (!delegator || !isAddress(delegator)) return
    await removeVoteMultiple(
      delegator,
      delegatorVotesData.localVoteAllocation.map((g) => g.gaugeId)
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVoteMultiple', err, FunctionName.REMOVE_VOTE_MULTIPLE))
  }, [delegator, isVotingOpen, delegatorVotesData.localVoteAllocation])

  return (
    <>
      <Flex>
        <Flex col widthP={100} gap={5}>
          <Text t4s textAlignCenter>
            If a user has chosen you as their delegate, you may vote for them.
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
                Total Points
              </Text>
              <Text techygradient big3>
                {delegatorVotesData.votePower.toString()}
              </Text>
            </Flex>
            <Flex col itemsCenter width={126}>
              <Text t6s>Used Percentage</Text>
              <Text big3>{(parseFloat(delegatorVotesData.usedVotePowerBPS.toString()) / 100).toString()}%</Text>
            </Flex>
          </Flex>
        </ShadowDiv>
        <Accordion isOpen={delegatorVotesData.localVoteAllocation.length > 0} thinScrollbar>
          <Flex col gap={10} p={10}>
            {delegatorVotesData.localVoteAllocation.map((voteData, i) => (
              <DelegatorVoteGauge key={i} index={i} />
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
              disabled={!cannotCallVoteMultiple}
              onClick={callVoteMultiple}
            >
              Set Votes
            </Button>
            <Button error widthP={100} onClick={callRemoveVoteMultiple}>
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
