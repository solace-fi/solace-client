import { BigNumber } from 'ethers'
import React, { useCallback, useMemo } from 'react'
import { FunctionName } from '../../../constants/enums'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useUwLockVoting } from '../../../hooks/lock/useUwLockVoting'
import { useVoteContext } from '../VoteContext'
import { GraySquareButton, ThinButton } from '../../../components/atoms/Button'
import { StyledArrowDropDown } from '../../../components/atoms/Icon'
import { Flex, ShadowDiv } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { processProtocolName } from '../../../components/organisms/Dropdown'
import { Card } from '../../../components/atoms/Card'
import { isAddress } from '../../../utils'
import { formatAmount } from '../../../utils/formatting'
import { VoteAllocation } from '../../../constants/types'

export const DelegatorVoteGauge = ({
  voteAllocData,
  index,
  delegator,
  isEditing,
}: {
  voteAllocData: VoteAllocation
  index: number
  delegator: string
  isEditing: boolean
}): JSX.Element => {
  const { gauges, voteGeneral, voteDelegators } = useVoteContext()
  const { isVotingOpen, onVoteInput, deleteVote } = voteGeneral
  const { handleGaugeSelectionModal } = gauges
  const { editingDelegatorVotesData, delegatorVotesData } = voteDelegators
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { vote, removeVote } = useUwLockVoting()

  const appId = useMemo(() => editingDelegatorVotesData.localVoteAllocation[index].gauge, [
    editingDelegatorVotesData,
    index,
  ])

  const callVote = useCallback(async () => {
    if (!delegator || !isAddress(delegator)) return
    if (!isVotingOpen) return
    if (!voteAllocData.changed) return
    if (
      !voteAllocData.gaugeActive &&
      !BigNumber.from(Math.floor(parseFloat(formatAmount(voteAllocData.votePowerPercentage)) * 100)).isZero()
    )
      return
    await vote(
      delegator,
      voteAllocData.gaugeId,
      BigNumber.from(Math.floor(parseFloat(formatAmount(voteAllocData.votePowerPercentage)) * 100))
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVote', err, FunctionName.VOTE))
  }, [voteAllocData, isVotingOpen])

  const callRemoveVote = useCallback(async () => {
    if (!delegator || !isAddress(delegator)) return
    if (!isVotingOpen) return
    await removeVote(delegator, voteAllocData.gaugeId)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVote', err, FunctionName.REMOVE_VOTE))
  }, [voteAllocData, isVotingOpen])

  return (
    <Card matchBg p={10}>
      {isEditing ? (
        <Flex col gap={10}>
          <Flex gap={10}>
            <div style={{ width: '180px' }}>
              <ThinButton onClick={() => handleGaugeSelectionModal(index, delegator)}>
                <Flex style={{ width: '100%' }} itemsCenter>
                  <Text autoAlignVertical p={5}>
                    {voteAllocData.gauge != '' && (
                      <img src={`https://assets.solace.fi/zapperLogos/${voteAllocData.gauge}`} height={16} />
                    )}
                  </Text>
                  <Text t5s style={{ width: '100%' }}>
                    <Flex between>
                      <Text t5s techygradient mont>
                        {voteAllocData.gauge != '' ? processProtocolName(voteAllocData.gauge) : 'Choose Gauge'}
                      </Text>
                      <StyledArrowDropDown size={16} />
                    </Flex>
                  </Text>
                </Flex>
              </ThinButton>
            </div>
            <div style={{ width: '70px' }}>
              <SmallerInputSection
                placeholder={'%'}
                value={voteAllocData.votePowerPercentage}
                onChange={(e) => onVoteInput(e.target.value, index, false)}
              />
            </div>
            {voteAllocData.added ? (
              <ShadowDiv>
                <GraySquareButton width={36} actuallyWhite noborder onClick={() => deleteVote(index, false)}>
                  X
                </GraySquareButton>
              </ShadowDiv>
            ) : (
              <div style={{ width: '36px' }}></div>
            )}
          </Flex>
          {editingDelegatorVotesData.localVoteAllocation.length > 1 && (
            <Flex justifyCenter gap={10}>
              {!voteAllocData.added && (
                <ThinButton onClick={callRemoveVote} widthP={100}>
                  <Text t5s>Remove</Text>
                </ThinButton>
              )}
              {isVotingOpen && (
                <ThinButton
                  onClick={callVote}
                  widthP={100}
                  disabled={
                    !voteAllocData.gaugeActive ||
                    !voteAllocData.changed ||
                    (parseFloat(formatAmount(voteAllocData.votePowerPercentage)) === 0 && voteAllocData.added) ||
                    editingDelegatorVotesData.localVoteAllocationPercentageTotal > 100
                  }
                >
                  <Text t5s>Save</Text>
                </ThinButton>
              )}
            </Flex>
          )}
        </Flex>
      ) : (
        <Flex gap={20} between>
          <Flex gap={5}>
            <Text autoAlignVertical p={5}>
              {appId != '' && <img src={`https://assets.solace.fi/zapperLogos/${appId}`} height={16} />}
            </Text>
            <Text t3 techygradient mont autoAlignVertical>
              {appId != '' ? processProtocolName(appId) : 'Choose Gauge'}
            </Text>
          </Flex>
          <Text bold autoAlignVertical t2>
            {delegatorVotesData.find((item) => item.delegator == delegator)?.localVoteAllocation[index]
              ?.votePowerPercentage ?? 0}
            %
          </Text>
        </Flex>
      )}
    </Card>
  )
}
