import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Accordion } from '../../components/atoms/Accordion'
import { Button } from '../../components/atoms/Button'
import { Flex, ShadowDiv } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { OwnerVoteGauge } from './organisms/OwnerVoteGauge'
import { useUwLockVoting } from '../../hooks/lock/useUwLockVoting'
import { useVoteContext } from './VoteContext'
import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { isAddress } from '../../utils'
import { filterAmount, formatAmount, truncateValue } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { StyledVote } from '../../components/atoms/Icon'
import { useCachedData } from '../../context/CachedDataManager'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import useDebounce from '@rooks/use-debounce'
import { useUwLocker } from '../../hooks/lock/useUwLocker'

export const OwnerVoteTab = () => {
  const { voteGeneral, voteOwner, delegateData } = useVoteContext()
  const { handleDelegateModalOpen } = delegateData
  const { isVotingOpen, addEmptyVote, onVoteInput, epochEnd } = voteGeneral
  const { remainingTime } = epochEnd

  const { votesData, editingVotesData, handleEditingVotesData } = voteOwner

  const { positiveVersion } = useCachedData()

  const { vote, removeVote, voteMultiple, removeVoteMultiple } = useUwLockVoting()
  const { getAllLockIDsOf } = useUwLocker()
  const { account } = useWeb3React()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const [isEditing, setIsEditing] = useState(false)
  const [commonPercentage, setCommonPercentage] = useState<string>('')
  const [numLocks, setNumLocks] = useState<number>(0)

  /**  can call vote multiple if all added or changed gauges are active,
   * the allocated vote power is not zero if added, and if there are changed or added votes
   * */
  const canCallVoteMultiple = useMemo(() => {
    const containsChangedOrAddedActiveGauges =
      editingVotesData.localVoteAllocation.filter((g) => {
        return g.gaugeActive && (g.added || g.changed)
      }).length > 0

    const hasZeroAllocsForAdded =
      editingVotesData.localVoteAllocation.filter((g) => {
        return g.added && BigNumber.from(Math.floor(parseFloat(formatAmount(g.votePowerPercentage)) * 100)).isZero()
      }).length > 0

    const hasUnselectedGauges = editingVotesData.localVoteAllocation.filter((g) => g.gaugeId.eq(ZERO)).length > 0

    return containsChangedOrAddedActiveGauges && !hasZeroAllocsForAdded && !hasUnselectedGauges
  }, [editingVotesData.localVoteAllocation])

  const callVoteMultiple = useCallback(async () => {
    if (!canCallVoteMultiple) return
    if (!isVotingOpen) return
    if (!account || !isAddress(account)) return
    const queuedVotes = editingVotesData.localVoteAllocation.filter((g) => (g.changed || g.added) && g.gaugeActive)
    if (queuedVotes.length > 1) {
      await voteMultiple(
        account,
        queuedVotes.map((g) => g.gaugeId),
        queuedVotes.map((g) => BigNumber.from(Math.floor(parseFloat(formatAmount(g.votePowerPercentage)) * 100)))
      )
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callVoteMultiple', err, FunctionName.VOTE_MULTIPLE))
    } else {
      await vote(
        account,
        queuedVotes[0].gaugeId,
        BigNumber.from(Math.floor(parseFloat(formatAmount(queuedVotes[0].votePowerPercentage)) * 100))
      )
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callVote', err, FunctionName.VOTE))
    }
  }, [account, canCallVoteMultiple, isVotingOpen, editingVotesData.localVoteAllocation])

  const callRemoveVoteMultiple = useCallback(async () => {
    if (!isVotingOpen) return
    if (!account || !isAddress(account)) return
    if (editingVotesData.localVoteAllocation.length > 1) {
      await removeVoteMultiple(
        account,
        editingVotesData.localVoteAllocation.map((g) => g.gaugeId)
      )
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callRemoveVoteMultiple', err, FunctionName.REMOVE_VOTE_MULTIPLE))
    } else {
      await removeVote(account, editingVotesData.localVoteAllocation[0].gaugeId)
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callRemoveVote', err, FunctionName.REMOVE_VOTE))
    }
  }, [account, isVotingOpen, editingVotesData.localVoteAllocation])

  const setCommonPercentageValue = useDebounce(() => {
    for (let i = 0; i < editingVotesData.localVoteAllocation.length; i++) {
      onVoteInput(commonPercentage, i, true)
    }
  }, 300)

  useEffect(() => {
    if (isEditing) setCommonPercentageValue()
  }, [commonPercentage, setCommonPercentageValue])

  useEffect(() => {
    setIsEditing(false)
  }, [positiveVersion])

  useEffect(() => {
    if (!isEditing) handleEditingVotesData(votesData)
  }, [isEditing])

  useEffect(() => {
    const getLocks = async () => {
      if (!account || !isAddress(account)) {
        setNumLocks(0)
        return
      }
      const lockIDs = await getAllLockIDsOf(account)
      setNumLocks(lockIDs.length)
    }
    getLocks()
  }, [account, getAllLockIDsOf])

  return (
    <>
      {isVotingOpen && (
        <Flex col gap={5}>
          <Text t4s textAlignCenter>
            Epoch time remaining
          </Text>
          <Text t2 textAlignCenter info>
            {remainingTime.days}d {remainingTime.hours}h {remainingTime.minutes}m {remainingTime.seconds}s
          </Text>
        </Flex>
      )}
      <Flex between>
        <Text semibold t2>
          My Gauge Votes
        </Text>
        <Flex gap={10}>
          <Button secondary info noborder onClick={() => handleDelegateModalOpen(true)}>
            <StyledVote size={20} style={{ marginRight: '5px' }} /> Delegate
          </Button>
        </Flex>
      </Flex>
      <Flex col itemsCenter gap={15}>
        <ShadowDiv>
          <Flex gap={12} p={10}>
            <Flex col itemsCenter width={100}>
              <Text techygradient t6s>
                Total Points
              </Text>
              <Text techygradient big3>
                {truncateValue(formatUnits(votesData.votePower, 18), 2)}
              </Text>
            </Flex>
            <Flex col itemsCenter width={100}>
              <Text t6s>Used Percentage</Text>
              <Text big3>{(parseFloat(votesData.usedVotePowerBPS.toString()) / 100).toString()}%</Text>
            </Flex>
            <Button techygradient secondary noborder onClick={() => setIsEditing(!isEditing)}>
              {!isEditing
                ? editingVotesData.localVoteAllocation.length > 0
                  ? `Edit Votes`
                  : `Add Votes`
                : `End Edits`}
            </Button>
          </Flex>
        </ShadowDiv>
        {editingVotesData.localVoteAllocation.length === 0 && numLocks > 0 && (
          <Flex col gap={10}>
            <Text>No votes found</Text>
          </Flex>
        )}
        {editingVotesData.localVoteAllocation.length > 1 && isEditing && (
          <Flex col gap={5}>
            <Text t5s>Set all to this percentage</Text>
            <SmallerInputSection
              placeholder={'%'}
              value={commonPercentage}
              onChange={(e) => setCommonPercentage(filterAmount(e.target.value, commonPercentage))}
              style={{
                width: '100%',
                border: 'none',
              }}
            />
          </Flex>
        )}
        {editingVotesData.localVoteAllocation.length > 0 && (
          <Accordion isOpen={true} thinScrollbar widthP={!isEditing ? 100 : undefined}>
            <Flex col gap={10} p={10}>
              {editingVotesData.localVoteAllocation.map((voteData, i) => (
                <OwnerVoteGauge key={i} index={i} isEditing={isEditing} voteAllocData={voteData} />
              ))}
            </Flex>
          </Accordion>
        )}
        {numLocks == 0 && (
          <Text t4s warning>
            You must have locks in order to vote
          </Text>
        )}
        {isVotingOpen && numLocks > 0 && isEditing && (
          <>
            <Button onClick={() => addEmptyVote(true)} noborder>
              <Text
                underline
                semibold
                style={{
                  // underline width is 2 pixels
                  textDecorationWidth: '3px',
                  // separated by 3 pixels from the text
                  textUnderlineOffset: '5px',
                }}
              >
                + Add Gauge Vote
              </Text>
            </Button>
            <Button
              techygradient
              secondary
              noborder
              widthP={100}
              disabled={
                !canCallVoteMultiple ||
                editingVotesData.localVoteAllocation.filter((item) => item.changed).length == 0 ||
                editingVotesData.localVoteAllocationPercentageTotal > 100
              }
              onClick={callVoteMultiple}
            >
              <Text t3>Save Votes</Text>
            </Button>
            {editingVotesData.localVoteAllocation.filter((item) => !item.added).length > 0 && (
              <Button error widthP={100} onClick={callRemoveVoteMultiple}>
                <Text t3>Remove all votes</Text>
              </Button>
            )}
          </>
        )}
        {!isVotingOpen && numLocks > 0 && <Text t4s>Voting is closed</Text>}
      </Flex>
    </>
  )
}
