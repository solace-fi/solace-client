import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import React, { useCallback, useMemo } from 'react'
import { FunctionName } from '../../../constants/enums'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useUwLockVoting } from '../../../hooks/lock/useUwLockVoting'
import { useVoteContext } from '../VoteContext'
import { Button, GraySquareButton, ThinButton } from '../../../components/atoms/Button'
import { StyledArrowDropDown } from '../../../components/atoms/Icon'
import { Flex, ShadowDiv } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { processProtocolName } from '../../../components/organisms/Dropdown'
import { Card } from '../../../components/atoms/Card'
import { isAddress } from '../../../utils'
import { formatAmount } from '../../../utils/formatting'

export const OwnerVoteGauge = ({ index, isEditing }: { index: number; isEditing: boolean }): JSX.Element => {
  const { account } = useWeb3React()
  const { gauges, voteGeneral, voteOwner } = useVoteContext()
  const { isVotingOpen, onVoteInput, deleteVote } = voteGeneral
  const { handleGaugeSelectionModal } = gauges
  const { editingVotesData, votesData } = voteOwner
  const appId = useMemo(() => editingVotesData.localVoteAllocation[index].gauge, [editingVotesData, index])
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { vote, removeVote } = useUwLockVoting()

  const callVote = useCallback(async () => {
    if (!account || !isAddress(account)) return
    if (!isVotingOpen) return
    if (!editingVotesData.localVoteAllocation[index].changed) return
    if (
      !editingVotesData.localVoteAllocation[index].gaugeActive &&
      !BigNumber.from(
        Math.floor(parseFloat(formatAmount(editingVotesData.localVoteAllocation[index].votePowerPercentage)) * 100)
      ).isZero()
    )
      return
    await vote(
      account,
      editingVotesData.localVoteAllocation[index].gaugeId,
      BigNumber.from(
        Math.floor(parseFloat(formatAmount(editingVotesData.localVoteAllocation[index].votePowerPercentage)) * 100)
      )
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVote', err, FunctionName.VOTE))
  }, [account, editingVotesData.localVoteAllocation, index, isVotingOpen])

  const callRemoveVote = useCallback(async () => {
    if (!account || !isAddress(account)) return
    if (!isVotingOpen) return
    await removeVote(account, editingVotesData.localVoteAllocation[index].gaugeId)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVote', err, FunctionName.REMOVE_VOTE))
  }, [account, editingVotesData.localVoteAllocation, index, isVotingOpen])

  return (
    <Card matchBg p={10}>
      {isEditing ? (
        <Flex col gap={10}>
          <Flex gap={10}>
            <div style={{ width: '180px' }}>
              <ThinButton onClick={() => handleGaugeSelectionModal(index)}>
                <Flex style={{ width: '100%' }} itemsCenter>
                  <Text autoAlignVertical p={5}>
                    {appId != '' && <img src={`https://assets.solace.fi/zapperLogos/${appId}`} height={16} />}
                  </Text>
                  <Text t5s style={{ width: '100%' }}>
                    <Flex between>
                      <Text t5s techygradient mont>
                        {appId != '' ? processProtocolName(appId) : 'Choose Gauge'}
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
                value={editingVotesData.localVoteAllocation[index].votePowerPercentage}
                onChange={(e) => onVoteInput(e.target.value, index, true)}
              />
            </div>
            {editingVotesData.localVoteAllocation[index].added ? (
              <ShadowDiv>
                <GraySquareButton width={36} actuallyWhite noborder onClick={() => deleteVote(index, true)}>
                  X
                </GraySquareButton>
              </ShadowDiv>
            ) : (
              <div style={{ width: '36px' }}></div>
            )}
          </Flex>
          <Flex justifyCenter gap={10}>
            {!editingVotesData.localVoteAllocation[index].added && (
              <ThinButton onClick={callRemoveVote} widthP={100}>
                <Text t5s>Remove vote</Text>
              </ThinButton>
            )}
            {isVotingOpen && (
              <ThinButton
                onClick={callVote}
                widthP={100}
                disabled={
                  !editingVotesData.localVoteAllocation[index].gaugeActive ||
                  !editingVotesData.localVoteAllocation[index].changed ||
                  (parseFloat(formatAmount(editingVotesData.localVoteAllocation[index].votePowerPercentage)) === 0 &&
                    editingVotesData.localVoteAllocation[index].added) ||
                  editingVotesData.localVoteAllocationTotal > 100
                }
              >
                <Text t5s>Save Vote</Text>
              </ThinButton>
            )}
          </Flex>
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
            {votesData.localVoteAllocation[index].votePowerPercentage}%
          </Text>
        </Flex>
      )}
    </Card>
  )
}
