import React, { useCallback, useMemo, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Accordion } from '../../components/atoms/Accordion'
import { Button } from '../../components/atoms/Button'
import { Flex, ShadowDiv } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { OwnerVoteGauge } from './organisms/OwnerVoteGauge'
import { useUwLockVoting } from '../../hooks/lock/useUwLockVoting'
import { useVoteContext } from './VoteContext'
import { BigNumber } from '@solace-fi/sdk-nightly'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { isAddress } from '../../utils'
import { formatAmount, truncateValue } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { StyledVoteYea } from '../../components/atoms/Icon'

export const OwnerVoteTab = () => {
  const { voteGeneral, voteOwner, delegateData } = useVoteContext()
  const { handleDelegateModalOpen } = delegateData
  const { isVotingOpen, addEmptyVote } = voteGeneral
  const { votesData, editingVotesData } = voteOwner

  const { voteMultiple, removeVoteMultiple } = useUwLockVoting()
  const { account } = useWeb3React()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const [isEditing, setIsEditing] = useState(false)

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

    return containsChangedOrAddedActiveGauges && !hasZeroAllocsForAdded
  }, [editingVotesData.localVoteAllocation])

  const callVoteMultiple = useCallback(async () => {
    if (!canCallVoteMultiple) return
    if (!isVotingOpen) return
    if (!account || !isAddress(account)) return
    const queuedVotes = editingVotesData.localVoteAllocation.filter((g) => g.changed || g.added)
    await voteMultiple(
      account,
      queuedVotes.map((g) => g.gaugeId),
      queuedVotes.map((g) => BigNumber.from(Math.floor(parseFloat(formatAmount(g.votePowerPercentage)) * 100)))
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVoteMultiple', err, FunctionName.VOTE_MULTIPLE))
  }, [account, canCallVoteMultiple, isVotingOpen, editingVotesData.localVoteAllocation])

  const callRemoveVoteMultiple = useCallback(async () => {
    if (!isVotingOpen) return
    if (!account || !isAddress(account)) return
    await removeVoteMultiple(
      account,
      editingVotesData.localVoteAllocation.map((g) => g.gaugeId)
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVoteMultiple', err, FunctionName.REMOVE_VOTE_MULTIPLE))
  }, [account, isVotingOpen, editingVotesData.localVoteAllocation])

  return (
    <>
      <Flex between>
        <Text semibold t2>
          My Gauge Votes
        </Text>
        <Flex gap={10}>
          <Button secondary info noborder onClick={() => handleDelegateModalOpen(true)}>
            <StyledVoteYea size={20} style={{ marginRight: '5px' }} /> Delegate
          </Button>
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
                {truncateValue(formatUnits(votesData.votePower, 18), 2)}
              </Text>
            </Flex>
            <Flex col itemsCenter width={126}>
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
        {editingVotesData.localVoteAllocation.length === 0 && (
          <Flex col gap={10}>
            <Text>No votes found</Text>
          </Flex>
        )}
        {editingVotesData.localVoteAllocation.length > 0 && (
          <Accordion isOpen={true} thinScrollbar widthP={!isEditing ? 100 : undefined}>
            <Flex col gap={10} p={10}>
              {editingVotesData.localVoteAllocation.map((voteData, i) => (
                <OwnerVoteGauge key={i} index={i} isEditing={isEditing} />
              ))}
            </Flex>
          </Accordion>
        )}
        {isVotingOpen ? (
          isEditing ? (
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
                  editingVotesData.localVoteAllocationTotal > 100
                }
                onClick={callVoteMultiple}
              >
                Set Votes
              </Button>
              {editingVotesData.localVoteAllocation.filter((item) => !item.added).length > 0 && (
                <Button error widthP={100} onClick={callRemoveVoteMultiple}>
                  Remove all votes
                </Button>
              )}
            </>
          ) : null
        ) : (
          <Text t4s>Voting is closed</Text>
        )}
      </Flex>
    </>
  )
}
