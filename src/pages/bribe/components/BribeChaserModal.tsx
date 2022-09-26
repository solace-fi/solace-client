import { ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { StyledSlider } from '../../../components/atoms/Input'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { Modal } from '../../../components/molecules/Modal'
import { TileCard } from '../../../components/molecules/TileCard'
import { FunctionName } from '../../../constants/enums'
import { useBribeController } from '../../../hooks/bribe/useBribeController'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { truncateValue } from '../../../utils/formatting'
import { useVoteContext } from '../../vote/VoteContext'
import { useBribeContext } from '../BribeContext'

export const BribeChaserModal = ({
  isOpen,
  handleClose,
  selectedGaugeId,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedGaugeId: BigNumber
}): JSX.Element => {
  const { account } = useWeb3React()
  const { voteForBribe, removeVoteForBribe } = useBribeController()
  const { handleContractCallError, handleToast } = useTransactionExecution()
  const { voteGeneral, voteOwner } = useVoteContext()
  const { isVotingOpen } = voteGeneral
  const { votesData } = voteOwner

  const { bribes } = useBribeContext()
  const { gaugeBribeInfo } = bribes

  const [rangeInputBPS, setRangeInputBPS] = useState<number>(0)

  const gaugeName = useMemo(
    () => gaugeBribeInfo.find((gauge) => gauge.gaugeID.eq(selectedGaugeId))?.gaugeName ?? 'Unknown Gauge',
    [selectedGaugeId, gaugeBribeInfo]
  )

  const currentVoterBPS = useMemo(() => {
    if (!account) return ZERO
    return (
      gaugeBribeInfo
        .find((info) => info.gaugeID.eq(selectedGaugeId))
        ?.votes.find((vote) => vote.voter.toLowerCase() == account.toLowerCase())?.votePowerBPS ?? ZERO
    )
  }, [gaugeBribeInfo, selectedGaugeId, account])

  const callVoteForBribe = useCallback(async () => {
    if (!account) return
    await voteForBribe(account, selectedGaugeId, BigNumber.from(rangeInputBPS))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callVoteForBribe', err, FunctionName.BRIBE_VOTE))
  }, [account, selectedGaugeId, rangeInputBPS, voteForBribe])

  const callRemoveVoteForBribe = useCallback(async () => {
    if (!account) return
    await removeVoteForBribe(account, selectedGaugeId)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callRemoveVoteForBribe', err, FunctionName.BRIBE_REMOVE_VOTE))
  }, [account, selectedGaugeId, removeVoteForBribe])

  const handleVote = useCallback(async () => {
    if (rangeInputBPS == 0 && currentVoterBPS.gt(ZERO)) {
      await callRemoveVoteForBribe()
    } else if (rangeInputBPS > 0) {
      await callVoteForBribe()
    }
  }, [rangeInputBPS, currentVoterBPS, callVoteForBribe, callRemoveVoteForBribe])

  useEffect(() => {
    setRangeInputBPS(parseInt(currentVoterBPS.toString()))
  }, [currentVoterBPS, isOpen])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={gaugeName}>
      <Flex col gap={16}>
        <Text info textAlignCenter>
          {(rangeInputBPS / 100).toString()}%
        </Text>
        <StyledSlider
          value={rangeInputBPS}
          onChange={(e) => {
            setRangeInputBPS(parseInt(e.target.value))
          }}
          min={0}
          max={10000}
        />
        <Flex gap={16}>
          <TileCard>
            <Text t6s bold textAlignCenter>
              Available Votes
            </Text>
            <Text bold textAlignCenter>
              {truncateValue(formatUnits(votesData.votePower, 18), 2)}
            </Text>
          </TileCard>
          <TileCard>
            <Text t6s bold textAlignCenter>
              Used Percentage
            </Text>
            <Text bold textAlignCenter info>
              {(parseFloat(currentVoterBPS.toString()) / 100).toString()}%
            </Text>
          </TileCard>
        </Flex>
        <Button info onClick={handleVote}>
          Allocate votes
        </Button>
      </Flex>
    </Modal>
  )
}
