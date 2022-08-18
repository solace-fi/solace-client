import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import React, { useCallback, useMemo } from 'react'
import { FunctionName } from '../../../constants/enums'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useUwLockVoting } from '../../../hooks/lock/useUwLockVoting'
import { useVoteContext } from '../VoteContext'
import { Button, GraySquareButton, ThinButton } from '../../../components/atoms/Button'
import { StyledArrowDropDown, StyledClose } from '../../../components/atoms/Icon'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { processProtocolName } from '../../../components/organisms/Dropdown'
import { Card } from '../../../components/atoms/Card'
import { isAddress } from '../../../utils'
import { formatAmount } from '../../../utils/formatting'

export const OwnerVoteGauge = ({ index }: { index: number }): JSX.Element => {
  const { account } = useWeb3React()
  const { gauges, voteGeneral, voteOwner } = useVoteContext()
  const { isVotingOpen, onVoteInput, deleteVote } = voteGeneral
  const { handleGaugeSelectionModal } = gauges
  const { votesData } = voteOwner
  const appId = useMemo(() => votesData.localVoteAllocation[index].gauge, [votesData, index])
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { vote, removeVote } = useUwLockVoting()

  const callVote = useCallback(async () => {
    if (!account || !isAddress(account)) return
    if (!isVotingOpen) return
    if (!votesData.localVoteAllocation[index].changed) return
    if (
      !votesData.localVoteAllocation[index].gaugeActive &&
      !BigNumber.from(
        Math.floor(parseFloat(formatAmount(votesData.localVoteAllocation[index].votePowerPercentage)) * 100)
      ).isZero()
    )
      return
    await vote(
      account,
      votesData.localVoteAllocation[index].gaugeId,
      BigNumber.from(
        Math.floor(parseFloat(formatAmount(votesData.localVoteAllocation[index].votePowerPercentage)) * 100)
      )
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVote', err, FunctionName.VOTE))
  }, [account, votesData.localVoteAllocation[index].votePowerPercentage, index, isVotingOpen])

  const callRemoveVote = useCallback(async () => {
    if (!account || !isAddress(account)) return
    if (!isVotingOpen) return
    await removeVote(account, votesData.localVoteAllocation[index].gaugeId)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVote', err, FunctionName.REMOVE_VOTE))
  }, [account, votesData.localVoteAllocation, index, isVotingOpen])

  return (
    <Card matchBg p={10}>
      <Flex col gap={10}>
        <Flex gap={10}>
          <div style={{ width: '150px' }}>
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
          <div style={{ width: '100px' }}>
            <SmallerInputSection
              placeholder={'%'}
              value={votesData.localVoteAllocation[index].votePowerPercentage}
              onChange={(e) => onVoteInput(e.target.value, index, true)}
            />
          </div>
          {votesData.localVoteAllocation[index].added ? (
            <GraySquareButton width={32} height={32} noborder onClick={() => deleteVote(index, true)} darkText>
              <StyledClose size={16} />
            </GraySquareButton>
          ) : (
            <div style={{ width: '32px' }}></div>
          )}
        </Flex>
        <Flex justifyCenter gap={10}>
          {!votesData.localVoteAllocation[index].added && (
            <Button error onClick={callRemoveVote} widthP={100}>
              Remove vote
            </Button>
          )}
          <Button secondary noborder techygradient onClick={callVote} widthP={100}>
            Save Vote
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}
