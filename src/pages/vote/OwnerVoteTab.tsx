import React, { useCallback, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Accordion } from '../../components/atoms/Accordion'
import { Button } from '../../components/atoms/Button'
import { Flex, ShadowDiv } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { OwnerVoteGauge } from './organisms/OwnerVoteGauge'
import { useUwpLockVoting } from '../../hooks/lock/useUwpLockVoting'
import { useVoteContext } from './VoteContext'
import { ZERO } from '../../constants'
import { BigNumber } from '@solace-fi/sdk-nightly'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { isAddress } from '../../utils'

export const OwnerVoteTab = () => {
  const { voteGeneral, voteOwner } = useVoteContext()
  const { isVotingOpen, addEmptyVote } = voteGeneral
  const { votesData } = voteOwner

  const { voteMultiple, removeVoteMultiple } = useUwpLockVoting()
  const { account } = useWeb3React()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  /** cannot call vote multiple if any gauges of changed or added votes 
      are inactive and the allocated vote power is not zero
  */
  const cannotCallVoteMultiple = useMemo(
    () =>
      votesData.voteAllocation.filter((g) => {
        return (
          !g.gaugeActive &&
          !(votesData.votePower.isZero()
            ? ZERO
            : BigNumber.from(g.votes == '' ? '0' : g.votes).mul(BigNumber.from('10000').div(votesData.votePower))
          ).isZero() &&
          (g.changed || g.added)
        )
      }).length > 0,
    [votesData.voteAllocation, votesData.votePower]
  )

  const callVoteMultiple = useCallback(async () => {
    if (cannotCallVoteMultiple) return
    if (!isVotingOpen) return
    if (!account || !isAddress(account)) return
    const queuedVotes = votesData.voteAllocation.filter((g) => g.changed || g.added)
    await voteMultiple(
      account,
      queuedVotes.map((g) => g.gaugeId),
      queuedVotes.map((g) =>
        votesData.votePower.isZero()
          ? ZERO
          : BigNumber.from(g.votes == '' ? '0' : g.votes).mul(BigNumber.from('10000').div(votesData.votePower))
      )
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVoteMultiple', err, FunctionName.VOTE_MULTIPLE))
  }, [account, cannotCallVoteMultiple, isVotingOpen, votesData.voteAllocation, votesData.votePower])

  const callRemoveVoteMultiple = useCallback(async () => {
    if (!isVotingOpen) return
    if (!account || !isAddress(account)) return
    await removeVoteMultiple(
      account,
      votesData.voteAllocation.map((g) => g.gaugeId)
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVoteMultiple', err, FunctionName.REMOVE_VOTE_MULTIPLE))
  }, [account, isVotingOpen, votesData.voteAllocation])

  return (
    <>
      <Flex>
        <Text semibold t2>
          My Gauge Votes
        </Text>
      </Flex>
      <Flex col itemsCenter gap={15}>
        <ShadowDiv>
          <Flex gap={12} p={10}>
            <Flex col itemsCenter width={126}>
              <Text techygradient t6s>
                My Total Points
              </Text>
              <Text techygradient big3>
                239
              </Text>
            </Flex>
            <Flex col itemsCenter width={126}>
              <Text t6s>My Used Points</Text>
              <Text big3>239</Text>
            </Flex>
          </Flex>
        </ShadowDiv>
        <Accordion isOpen={votesData.voteAllocation.length > 0} thinScrollbar>
          <Flex col gap={10} p={10}>
            {votesData.voteAllocation.map((voteData, i) => (
              <OwnerVoteGauge key={i} index={i} />
            ))}
          </Flex>
        </Accordion>
        {isVotingOpen ? (
          <>
            <Button onClick={() => addEmptyVote(true)}>+ Add Gauge Vote</Button>
            <Button
              techygradient
              secondary
              noborder
              widthP={100}
              disabled={cannotCallVoteMultiple}
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
