import { ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import React, { useCallback, useMemo } from 'react'
import { FunctionName } from '../../../constants/enums'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useUwpLockVoting } from '../../../hooks/lock/useUwpLockVoting'
import { useVoteContext } from '../VoteContext'
import { Button, ThinButton } from '../../../components/atoms/Button'
import { StyledArrowDropDown } from '../../../components/atoms/Icon'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { processProtocolName } from '../../../components/organisms/Dropdown'
import { Card } from '../../../components/atoms/Card'
import { isAddress } from '../../../utils'

export const OwnerVoteGauge = ({ index }: { index: number }): JSX.Element => {
  const { account } = useWeb3React()
  const { gauges, voteGeneral, voteOwner } = useVoteContext()
  const { isVotingOpen, onVoteInput, deleteVote } = voteGeneral
  const { handleGaugeSelectionModal } = gauges
  const { votesData } = voteOwner
  const appId = useMemo(() => votesData.voteAllocation[index].gauge, [votesData, index])
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { vote, removeVote } = useUwpLockVoting()

  const votes = useMemo(
    () => (votesData.voteAllocation[index].votes == '' ? '0' : votesData.voteAllocation[index].votes),
    [votesData.voteAllocation, index]
  )

  const convertedVoteBPS = useMemo(
    () =>
      votesData.votePower.isZero() ? ZERO : BigNumber.from(votes).mul(BigNumber.from('10000').div(votesData.votePower)),
    [votes, votesData.votePower]
  )

  const callVote = useCallback(async () => {
    if (!account || !isAddress(account)) return
    if (!isVotingOpen) return
    if (!votesData.voteAllocation[index].changed) return
    if (!votesData.voteAllocation[index].gaugeActive && !convertedVoteBPS.isZero()) return
    await vote(account, votesData.voteAllocation[index].gaugeId, convertedVoteBPS)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVote', err, FunctionName.VOTE))
  }, [account, convertedVoteBPS, votesData.voteAllocation[index], isVotingOpen])

  const callRemoveVote = useCallback(async () => {
    if (!account || !isAddress(account)) return
    if (!isVotingOpen) return
    await removeVote(account, votesData.voteAllocation[index].gaugeId)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVote', err, FunctionName.REMOVE_VOTE))
  }, [account, votesData.voteAllocation[index], isVotingOpen])

  return (
    <Card matchBg p={10}>
      <Flex col gap={10}>
        <Flex gap={10}>
          <div style={{ width: '150px' }}>
            <ThinButton onClick={() => handleGaugeSelectionModal(index)}>
              <Flex style={{ width: '100%' }} itemsCenter>
                <Text autoAlignVertical p={5}>
                  <img src={`https://assets.solace.fi/zapperLogos/${appId}`} height={16} />
                </Text>
                <Text t5s style={{ width: '100%' }}>
                  <Flex between>
                    <Text t5s techygradient mont>
                      {appId != '' ? processProtocolName(appId) : 'Choose Protocol'}
                    </Text>
                    <StyledArrowDropDown size={16} />
                  </Flex>
                </Text>
              </Flex>
            </ThinButton>
          </div>
          <div style={{ width: '100px' }}>
            <SmallerInputSection
              placeholder={'Number of Votes'}
              value={votesData.voteAllocation[index].votes}
              onChange={(e) => onVoteInput(e.target.value, index, true)}
            />
          </div>
          {votesData.voteAllocation[index].added && <Button onClick={() => deleteVote(index, true)}>Close</Button>}
        </Flex>
        <Flex justifyCenter gap={10}>
          <Button error onClick={callRemoveVote} widthP={100}>
            Remove vote
          </Button>
          <Button secondary noborder techygradient onClick={callVote} widthP={100}>
            Save Vote
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}
