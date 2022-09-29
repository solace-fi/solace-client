import { ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { StyledSlider } from '../../../components/atoms/Input'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { TileCard } from '../../../components/molecules/TileCard'
import { FunctionName } from '../../../constants/enums'
import { useBribeController } from '../../../hooks/bribe/useBribeController'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { filterAmount, formatAmount, truncateValue } from '../../../utils/formatting'
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
  const { gaugeBribeInfo, bribeTokens, userAvailableVotePowerBPS } = bribes

  const [rangeInputValue, setRangeInputValue] = useState<string>('')
  const [rangeInputBPS, setRangeInputBPS] = useState<number>(0)

  const currentVoterBPS = useMemo(() => {
    if (!account) return ZERO
    return (
      gaugeBribeInfo
        .find((info) => info.gaugeID.eq(selectedGaugeId))
        ?.votes.find((vote) => vote.voter.toLowerCase() == account.toLowerCase())?.votePowerBPS ?? ZERO
    )
  }, [gaugeBribeInfo, selectedGaugeId, account])

  const canAllocate = useMemo(() => {
    const initialAllocCheck = BigNumber.from(rangeInputBPS).isZero() && currentVoterBPS.isZero()
    const difference = BigNumber.from(rangeInputBPS).gt(currentVoterBPS)
      ? BigNumber.from(rangeInputBPS).sub(currentVoterBPS)
      : ZERO
    return BigNumber.from(userAvailableVotePowerBPS).gte(difference) && isVotingOpen && !initialAllocCheck
  }, [isVotingOpen, userAvailableVotePowerBPS, rangeInputBPS, currentVoterBPS])

  const gaugeName = useMemo(
    () => gaugeBribeInfo.find((gauge) => gauge.gaugeID.eq(selectedGaugeId))?.gaugeName ?? 'Unknown Gauge',
    [selectedGaugeId, gaugeBribeInfo]
  )

  const projectedReward = useMemo(() => {
    if (votesData.votePower.isZero()) return 0
    const gaugeBribe = gaugeBribeInfo.find((info) => info.gaugeID.eq(selectedGaugeId))
    if (!gaugeBribe) return 0
    const totalBribeUSD = gaugeBribe.bribes.reduce((acc, bribe) => {
      let totalTokenUSD = 0
      const token = bribeTokens.find((token) => token.address.toLowerCase() === bribe.bribeToken.toLowerCase())
      if (token) {
        totalTokenUSD += token.price * parseFloat(formatUnits(bribe.bribeAmount, token.decimals))
      }
      return acc + totalTokenUSD
    }, 0)
    const partitionedVotePower = parseFloat(formatUnits(votesData.votePower, 18))
    if (partitionedVotePower === 0) return 0
    return truncateValue((totalBribeUSD * (rangeInputBPS / 100)) / partitionedVotePower)
  }, [votesData.votePower, gaugeBribeInfo, selectedGaugeId, bribeTokens, rangeInputBPS])

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

  const handleRangeInputValue = useCallback(
    (input: string) => {
      const filtered = filterAmount(input, rangeInputValue)
      const formatted = formatAmount(filtered)
      if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return
      if (parseFloat(formatted) > 100) return
      setRangeInputValue(filtered)
      setRangeInputBPS(parseFloat(formatted) * 100)
    },
    [rangeInputValue]
  )

  const handleRangeInputBPS = useCallback((bps: number) => {
    setRangeInputBPS(bps)
    setRangeInputValue((bps / 100).toString())
  }, [])

  const setMax = useCallback(() => {
    const max = Math.min(currentVoterBPS.toNumber() + userAvailableVotePowerBPS.toNumber(), 10000)
    setRangeInputValue((max / 100).toString())
    setRangeInputBPS(max)
  }, [currentVoterBPS, userAvailableVotePowerBPS])

  useEffect(() => {
    const voterInt = parseInt(currentVoterBPS.toString())
    setRangeInputBPS(voterInt)
    setRangeInputValue(voterInt == 0 ? '' : (voterInt / 100).toString())
  }, [currentVoterBPS, isOpen])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={gaugeName}>
      <Flex col gap={16}>
        <Flex gap={16}>
          <TileCard>
            <Text t6s bold textAlignCenter>
              Total Vote Points
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
        <Flex gap={5}>
          <SmallerInputSection
            placeholder={'%'}
            value={rangeInputValue}
            onChange={(e) => handleRangeInputValue(e.target.value)}
          />
          <Button onClick={setMax}>MAX</Button>
        </Flex>
        <StyledSlider
          value={rangeInputBPS}
          onChange={(e) => {
            handleRangeInputBPS(parseInt(e.target.value))
          }}
          min={0}
          max={10000}
        />
        <TileCard>
          <Text t6s bold textAlignCenter>
            Projected Reward
          </Text>
          <Text bold textAlignCenter>
            ${projectedReward}
          </Text>
        </TileCard>
        <Button info onClick={handleVote} disabled={!canAllocate}>
          Allocate votes
        </Button>
        <Button error onClick={callRemoveVoteForBribe} disabled={currentVoterBPS.isZero()}>
          Remove Votes
        </Button>
      </Flex>
    </Modal>
  )
}
