import { BigNumber } from 'ethers'
import React, { useCallback } from 'react'
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

export const DelegatorVoteGauge = ({
  voteAllocData,
}: {
  voteAllocData: {
    delegator: string
    subIndex: number
    gauge: string
    gaugeId: BigNumber
    votePowerPercentage: string
    added: boolean
    changed: boolean
    gaugeActive: boolean
  }
}): JSX.Element => {
  const { gauges, voteGeneral, voteDelegators } = useVoteContext()
  const { isVotingOpen, onVoteInput, deleteVote } = voteGeneral
  const { handleGaugeSelectionModal } = gauges
  const { delegatorVotesData } = voteDelegators
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { vote, removeVote } = useUwLockVoting()

  const callVote = useCallback(async () => {
    if (!voteAllocData.delegator || !isAddress(voteAllocData.delegator)) return
    if (!isVotingOpen) return
    if (!voteAllocData.changed) return
    if (
      !voteAllocData.gaugeActive &&
      !BigNumber.from(Math.floor(parseFloat(formatAmount(voteAllocData.votePowerPercentage)) * 100)).isZero()
    )
      return
    await vote(
      voteAllocData.delegator,
      voteAllocData.gaugeId,
      BigNumber.from(Math.floor(parseFloat(formatAmount(voteAllocData.votePowerPercentage)) * 100))
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVote', err, FunctionName.VOTE))
  }, [voteAllocData, isVotingOpen])

  const callRemoveVote = useCallback(async () => {
    if (!voteAllocData.delegator || !isAddress(voteAllocData.delegator)) return
    if (!isVotingOpen) return
    await removeVote(voteAllocData.delegator, voteAllocData.gaugeId)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVote', err, FunctionName.REMOVE_VOTE))
  }, [voteAllocData, isVotingOpen])

  return (
    <Card matchBg p={10}>
      <Flex col gap={10}>
        <Flex gap={10}>
          <div style={{ width: '180px' }}>
            <ThinButton onClick={() => handleGaugeSelectionModal(voteAllocData.subIndex, voteAllocData.delegator)}>
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
              onChange={(e) => onVoteInput(e.target.value, voteAllocData.subIndex, voteAllocData.delegator)}
            />
          </div>
          {voteAllocData.added ? (
            <ShadowDiv>
              <GraySquareButton
                width={36}
                actuallyWhite
                noborder
                onClick={() => deleteVote(voteAllocData.subIndex, voteAllocData.delegator)}
              >
                X
              </GraySquareButton>
            </ShadowDiv>
          ) : (
            <div style={{ width: '36px' }}></div>
          )}
        </Flex>
        <Flex justifyCenter gap={10}>
          {!voteAllocData.added && (
            <Button error onClick={callRemoveVote} widthP={100}>
              Remove vote
            </Button>
          )}
          {isVotingOpen && (
            <Button
              secondary
              noborder
              techygradient
              onClick={callVote}
              widthP={100}
              disabled={
                !voteAllocData.gaugeActive ||
                !voteAllocData.changed ||
                (parseFloat(formatAmount(voteAllocData.votePowerPercentage)) === 0 && voteAllocData.added) ||
                (delegatorVotesData.find((item) => item.delegator == voteAllocData.delegator)
                  ?.localVoteAllocationTotal ?? 0) > 100
              }
            >
              Save Vote
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}
