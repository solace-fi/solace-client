import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatUnits, isAddress } from 'ethers/lib/utils'
import { Accordion } from '../../components/atoms/Accordion'
import { Button, ButtonAppearance } from '../../components/atoms/Button'
import { Flex, ShadowDiv } from '../../components/atoms/Layout'
import { DelegatorVoteGauge } from './organisms/DelegatorVoteGauge'
import { useUwLockVoting } from '../../hooks/lock/useUwLockVoting'
import { useVoteContext } from './VoteContext'
import { Text } from '../../components/atoms/Typography'
import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { filterAmount, floatUnits, formatAmount, shortenAddress, truncateValue } from '../../utils/formatting'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { useGeneral } from '../../context/GeneralManager'
import { CopyButton } from '../../components/molecules/CopyButton'
import { StyledArrowIosBackOutline } from '../../components/atoms/Icon'
import { useCachedData } from '../../context/CachedDataManager'
import useDebounce from '@rooks/use-debounce'

const TextDropdownOptions = ({
  searchedList,
  isOpen,
  noneText,
  onClick,
}: {
  searchedList: { mainText: string; secondaryText: string; icon?: JSX.Element }[]
  isOpen: boolean
  noneText?: string
  onClick: (value: string) => void
}): JSX.Element => {
  const { appTheme } = useGeneral()
  const gradientStyle = useMemo(
    () =>
      appTheme == 'light' ? { techygradient: true, warmgradient: false } : { techygradient: false, warmgradient: true },
    [appTheme]
  )

  return (
    <Accordion
      isOpen={isOpen}
      style={{ marginTop: isOpen ? 12 : 0, position: 'relative' }}
      customHeight={'380px'}
      thinScrollbar
      widthP={100}
    >
      <Flex col gap={8} p={12}>
        {searchedList.map((item) => (
          <ButtonAppearance
            key={item.mainText}
            matchBg
            secondary
            noborder
            pt={10.5}
            pb={10.5}
            pl={12}
            pr={12}
            onClick={() => onClick(item.mainText)}
            style={{ borderRadius: '8px' }}
          >
            <Flex between gap={12}>
              <Flex gap={8} itemsCenter>
                {item.icon ?? <Text t2>{shortenAddress(item.mainText)}</Text>}
              </Flex>
              <Text autoAlignVertical t3 bold {...gradientStyle}>
                {item.secondaryText}
              </Text>
            </Flex>
          </ButtonAppearance>
        ))}
        {searchedList.length === 0 && (
          <Text t3 textAlignCenter bold>
            {noneText ?? 'No results found'}
          </Text>
        )}
      </Flex>
    </Accordion>
  )
}

export const DelegatorVoteTab = () => {
  const { voteGeneral, voteDelegators } = useVoteContext()
  const { isVotingOpen, epochEnd, addEmptyVote, onVoteInput } = voteGeneral
  const { remainingTime } = epochEnd
  const { delegatorVotesData, editingDelegatorVotesData, handleEditingDelegatorVotesData } = voteDelegators

  const { positiveVersion } = useCachedData()
  const { vote, removeVote, voteMultiple, removeVoteMultiple } = useUwLockVoting()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const [showDelegatorSelection, setShowDelegatorSelection] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [commonPercentage, setCommonPercentage] = useState<string>('')

  const selectedDelegator = useMemo(() => editingDelegatorVotesData.delegator, [editingDelegatorVotesData])

  const [searchTerm, setSearchTerm] = useState('')

  const activeList = useMemo(() => {
    const filtered = searchTerm
      ? delegatorVotesData.filter((item) => item.delegator.toLowerCase().includes(searchTerm.toLowerCase()))
      : delegatorVotesData
    return filtered
      .sort((a, b) => {
        const calcA = floatUnits(a.votePower, 18)
        const calcB = floatUnits(b.votePower, 18)
        return calcB - calcA
      })
      .map((item) => {
        return {
          mainText: item.delegator,
          secondaryText: `${truncateValue(formatUnits(item.votePower, 18), 2)}`,
        }
      })
  }, [searchTerm, delegatorVotesData])

  const totalVotePower = useMemo(() => {
    return delegatorVotesData.reduce((acc, curr) => {
      return acc.add(curr.votePower)
    }, ZERO)
  }, [delegatorVotesData])

  const aggregatedUsedVotePowerBPS = useMemo(() => {
    const aggregatedUsedVotePower = delegatorVotesData.reduce((acc, curr) => {
      return acc + (parseFloat(curr.usedVotePowerBPS.toString()) / 100) * floatUnits(curr.votePower, 18)
    }, 0)
    return aggregatedUsedVotePower / floatUnits(totalVotePower, 18)
  }, [delegatorVotesData, totalVotePower])

  /** cannot call vote multiple if any gauges of changed or added votes 
      are inactive and the allocated vote power is not zero
  */

  const canCallVoteMultiple = useMemo(() => {
    const containsChangedOrAddedActiveGauges =
      editingDelegatorVotesData.localVoteAllocation.filter((g) => {
        return g.gaugeActive && (g.added || g.changed)
      }).length > 0

    const hasZeroAllocsForAdded =
      editingDelegatorVotesData.localVoteAllocation.filter((g) => {
        return g.added && BigNumber.from(Math.floor(parseFloat(formatAmount(g.votePowerPercentage)) * 100)).isZero()
      }).length > 0

    const hasUnselectedGauges =
      editingDelegatorVotesData.localVoteAllocation.filter((g) => g.gaugeId.eq(ZERO)).length > 0

    return containsChangedOrAddedActiveGauges && !hasZeroAllocsForAdded && !hasUnselectedGauges
  }, [editingDelegatorVotesData.localVoteAllocation])

  const callVoteMultiple = useCallback(async () => {
    if (!canCallVoteMultiple) return
    if (!isVotingOpen) return
    if (!selectedDelegator || !isAddress(selectedDelegator)) return
    const queuedVotes = editingDelegatorVotesData.localVoteAllocation.filter((g) => g.changed || g.added)
    if (queuedVotes.length === 0) return
    if (queuedVotes.length > 1) {
      await voteMultiple(
        selectedDelegator,
        queuedVotes.map((g) => g.gaugeId),
        queuedVotes.map((g) => BigNumber.from(Math.floor(parseFloat(formatAmount(g.votePowerPercentage)) * 100)))
      )
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callVoteMultiple', err, FunctionName.VOTE_MULTIPLE))
    } else {
      await vote(
        selectedDelegator,
        queuedVotes[0].gaugeId,
        BigNumber.from(Math.floor(parseFloat(formatAmount(queuedVotes[0].votePowerPercentage)) * 100))
      )
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callVote', err, FunctionName.VOTE))
    }
  }, [selectedDelegator, canCallVoteMultiple, isVotingOpen, editingDelegatorVotesData.localVoteAllocation])

  const callRemoveVoteMultiple = useCallback(async () => {
    if (!isVotingOpen) return
    if (!selectedDelegator || !isAddress(selectedDelegator)) return
    if (editingDelegatorVotesData.localVoteAllocation.length == 0) return
    if (editingDelegatorVotesData.localVoteAllocation.length > 1) {
      await removeVoteMultiple(
        selectedDelegator,
        editingDelegatorVotesData.localVoteAllocation.map((g) => g.gaugeId)
      )
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callRemoveVoteMultiple', err, FunctionName.REMOVE_VOTE_MULTIPLE))
    } else {
      await removeVote(selectedDelegator, editingDelegatorVotesData.localVoteAllocation[0].gaugeId)
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callRemoveVote', err, FunctionName.REMOVE_VOTE))
    }
  }, [selectedDelegator, isVotingOpen, editingDelegatorVotesData.localVoteAllocation])

  const setCommonPercentageValue = useDebounce(() => {
    for (let i = 0; i < editingDelegatorVotesData.localVoteAllocation.length; i++) {
      onVoteInput(commonPercentage, i, false)
    }
  }, 300)

  useEffect(() => {
    if (isEditing) setCommonPercentageValue()
  }, [commonPercentage, setCommonPercentageValue])

  useEffect(() => {
    setIsEditing(false)
  }, [positiveVersion])

  useEffect(() => {
    if (!isEditing)
      handleEditingDelegatorVotesData(
        delegatorVotesData.find((data) => data.delegator.toLowerCase() == selectedDelegator.toLowerCase()) ?? {
          delegator: '',
          votePower: ZERO,
          usedVotePowerBPS: ZERO,
          localVoteAllocation: [],
          localVoteAllocationPercentageTotal: 0,
        }
      )
  }, [isEditing])

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
      {showDelegatorSelection &&
        (delegatorVotesData.length > 0 ? (
          <>
            <Flex col itemsCenter>
              <ShadowDiv>
                <Flex gap={12} p={10}>
                  <Flex col itemsCenter width={100}>
                    <Text techygradient t6s>
                      Total Points
                    </Text>
                    <Text techygradient big3>
                      {truncateValue(formatUnits(totalVotePower, 18), 2)}
                    </Text>
                  </Flex>
                  <Flex col itemsCenter width={100}>
                    <Text t6s>Used Percentage</Text>
                    <Text big3>{truncateValue(aggregatedUsedVotePowerBPS, 2)}%</Text>
                  </Flex>
                  <Flex col itemsCenter width={100}>
                    <Text t6s>Delegators</Text>
                    <Text big3>{truncateValue(delegatorVotesData.length, 2)}</Text>
                  </Flex>
                </Flex>
              </ShadowDiv>
            </Flex>
            <Text>Select a delegator</Text>
            <SmallerInputSection
              placeholder={'Search'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
              }}
            />
            <TextDropdownOptions
              isOpen={true}
              searchedList={activeList}
              onClick={(value: string) => {
                handleEditingDelegatorVotesData(
                  delegatorVotesData.find((data) => data.delegator.toLowerCase() == value.toLowerCase()) ?? {
                    delegator: '',
                    votePower: ZERO,
                    usedVotePowerBPS: ZERO,
                    localVoteAllocation: [],
                    localVoteAllocationPercentageTotal: 0,
                  }
                )
                setShowDelegatorSelection(false)
              }}
            />
          </>
        ) : (
          <Text>You have no delegators.</Text>
        ))}
      {!showDelegatorSelection && (
        <>
          <Flex gap={10} stretch between>
            <Button onClick={() => setShowDelegatorSelection(true)} info>
              <StyledArrowIosBackOutline size={20} />
              Back
            </Button>
            <Text semibold t2 techygradient autoAlignVertical>
              {shortenAddress(selectedDelegator)}
            </Text>
            <CopyButton toCopy={selectedDelegator} objectName={''} />
          </Flex>
          <Flex col itemsCenter gap={15}>
            <ShadowDiv>
              <Flex gap={12} p={10}>
                <Flex col itemsCenter width={100}>
                  <Text techygradient t6s>
                    Total Points
                  </Text>
                  <Text techygradient big3>
                    {truncateValue(
                      formatUnits(
                        delegatorVotesData.find(
                          (data) => data.delegator.toLowerCase() == selectedDelegator.toLowerCase()
                        )?.votePower ?? ZERO,
                        18
                      ),
                      2
                    )}
                  </Text>
                </Flex>
                <Flex col itemsCenter width={100}>
                  <Text t6s>Used Percentage</Text>
                  <Text big3>
                    {(
                      parseFloat(
                        (
                          delegatorVotesData.find(
                            (data) => data.delegator.toLowerCase() == selectedDelegator.toLowerCase()
                          )?.usedVotePowerBPS ?? ZERO
                        ).toString()
                      ) / 100
                    ).toString()}
                    %
                  </Text>
                </Flex>
                <Button techygradient secondary noborder onClick={() => setIsEditing(!isEditing)}>
                  {!isEditing
                    ? editingDelegatorVotesData.localVoteAllocation.length > 0
                      ? `Edit Votes`
                      : `Add Votes`
                    : `End Edits`}
                </Button>{' '}
              </Flex>
            </ShadowDiv>
            {editingDelegatorVotesData.localVoteAllocation.length === 0 && (
              <Flex col gap={10}>
                <Text>No votes found</Text>
              </Flex>
            )}
            {editingDelegatorVotesData.localVoteAllocation.length > 1 && isEditing && (
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
            {editingDelegatorVotesData.localVoteAllocation.length > 0 && (
              <Accordion isOpen={true} thinScrollbar widthP={!isEditing ? 100 : undefined}>
                <Flex col gap={10} p={10}>
                  {editingDelegatorVotesData.localVoteAllocation.map((voteAllocData, i) => (
                    <DelegatorVoteGauge
                      key={i}
                      voteAllocData={voteAllocData}
                      index={i}
                      delegator={selectedDelegator}
                      isEditing={isEditing}
                    />
                  ))}
                </Flex>
              </Accordion>
            )}
            {isVotingOpen ? (
              isEditing ? (
                <>
                  <Button onClick={() => addEmptyVote(false)} noborder>
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
                      editingDelegatorVotesData.localVoteAllocation.filter((item) => item.changed).length == 0 ||
                      editingDelegatorVotesData.localVoteAllocationPercentageTotal > 100
                    }
                    onClick={callVoteMultiple}
                  >
                    <Text t3>Save Votes</Text>
                  </Button>
                  {editingDelegatorVotesData.localVoteAllocation.filter((item) => !item.added).length > 0 && (
                    <Button error widthP={100} onClick={callRemoveVoteMultiple}>
                      <Text t3>Remove all votes</Text>
                    </Button>
                  )}
                </>
              ) : null
            ) : (
              <Text t4s>Voting is closed</Text>
            )}
          </Flex>
        </>
      )}
    </>
  )
}
