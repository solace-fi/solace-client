import React, { useCallback, useMemo, useState } from 'react'
import { formatUnits } from 'ethers/lib/utils'
import { Accordion } from '../../components/atoms/Accordion'
import { Button } from '../../components/atoms/Button'
import { Flex, ShadowDiv } from '../../components/atoms/Layout'
import { DelegatorVoteGauge } from './organisms/DelegatorVoteGauge'
import { useUwLockVoting } from '../../hooks/lock/useUwLockVoting'
import { useVoteContext } from './VoteContext'
import { Text } from '../../components/atoms/Typography'
import { BigNumber, MulticallProvider, ZERO } from '@solace-fi/sdk-nightly'
import { FunctionName } from '../../constants/enums'
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { formatAmount, truncateValue } from '../../utils/formatting'
import { DelegatorSelectionModal } from './organisms/DelegatorSelectionModal'
import { useProvider } from '../../context/ProviderManager'
import { useNetwork } from '../../context/NetworkManager'
import { useContracts } from '../../context/ContractsManager'
import multicall from 'ethers-multicall'
import underwritingLockVotingABI from '../../constants/abi/UnderwritingLockVoting.json'

export const DelegatorVoteTab = () => {
  const { provider } = useProvider()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { uwLockVoting } = keyContracts
  const { voteGeneral, voteDelegators } = useVoteContext()
  const { isVotingOpen, addEmptyVote } = voteGeneral
  const { delegatorVotesData } = voteDelegators

  // todo: fix multicall and incorporate toasts somehow
  const { voteMultiple, removeVoteMultiple } = useUwLockVoting()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const [showDelegatorSelectionModal, setShowDelegatorSelectionModal] = useState(false)

  /** cannot call vote multiple if any gauges of changed or added votes 
      are inactive and the allocated vote power is not zero
  */

  const allAllocsArray = useMemo(() => {
    const res = []
    for (let i = 0; i < delegatorVotesData.length; i++) {
      const alloc = delegatorVotesData[i].localVoteAllocation.map((item, j) => {
        return {
          ...item,
          delegator: delegatorVotesData[i].delegator,
          subIndex: j,
        }
      })
      res.push(...alloc)
    }
    return res
  }, [delegatorVotesData])

  const totalVotePower = useMemo(() => {
    return delegatorVotesData.reduce((acc, curr) => {
      return acc.add(curr.votePower)
    }, ZERO)
  }, [delegatorVotesData])

  const totalAllocatedVotePower = useMemo(() => {
    return delegatorVotesData.reduce((acc, curr) => {
      return acc + curr.localVoteAllocationTotal
    }, 0)
  }, [delegatorVotesData])

  const cannotCallVoteMultiple = useMemo(
    () =>
      allAllocsArray.filter((g) => {
        return (
          !g.gaugeActive ||
          (BigNumber.from(Math.floor(parseFloat(formatAmount(g.votePowerPercentage)) * 100)).isZero() && g.added) ||
          !g.changed
        )
      }).length > 0,
    [allAllocsArray]
  )

  const callVoteMultiple = useCallback(async () => {
    if (!uwLockVoting) return
    const mcProvider = new MulticallProvider(provider, activeNetwork.chainId)
    const blockTag = await mcProvider._provider.getBlockNumber()
    const uwLockVotingMC = new multicall.Contract(uwLockVoting.address, underwritingLockVotingABI)

    const specificVotesToUpdate = allAllocsArray.filter((g) => (g.changed || g.added) && g.gaugeActive)
    const delegatorToVotesMapping: { [delegator: string]: { gaugeId: BigNumber; votePowerPercentage: string }[] } = {}
    specificVotesToUpdate.forEach((g) => {
      if (!delegatorToVotesMapping[g.delegator]) {
        delegatorToVotesMapping[g.delegator] = [{ gaugeId: g.gaugeId, votePowerPercentage: g.votePowerPercentage }]
      } else {
        delegatorToVotesMapping[g.delegator].push({ gaugeId: g.gaugeId, votePowerPercentage: g.votePowerPercentage })
      }
    })

    await mcProvider.all(
      delegatorVotesData.map((d) =>
        uwLockVotingMC.voteMultiple(
          d.delegator,
          delegatorToVotesMapping[d.delegator].map((v) => v.gaugeId),
          delegatorToVotesMapping[d.delegator].map((v) =>
            BigNumber.from(Math.floor(parseFloat(formatAmount(v.votePowerPercentage)) * 100))
          ),
          { blockTag: blockTag }
        )
      )
    )
  }, [allAllocsArray, delegatorVotesData, uwLockVoting, provider, activeNetwork.chainId])

  const callRemoveVoteMultiple = useCallback(async () => {
    if (!uwLockVoting) return
    const mcProvider = new MulticallProvider(provider, activeNetwork.chainId)
    const blockTag = await mcProvider._provider.getBlockNumber()
    const uwLockVotingMC = new multicall.Contract(uwLockVoting.address, underwritingLockVotingABI)
    const delegatorToVotesMapping: { [delegator: string]: { gaugeId: BigNumber }[] } = {}
    allAllocsArray.forEach((g) => {
      if (!delegatorToVotesMapping[g.delegator]) {
        delegatorToVotesMapping[g.delegator] = [{ gaugeId: g.gaugeId }]
      } else {
        delegatorToVotesMapping[g.delegator].push({ gaugeId: g.gaugeId })
      }
    })

    await mcProvider.all(
      delegatorVotesData.map(
        (d) =>
          uwLockVotingMC.voteMultiple(
            d.delegator,
            delegatorToVotesMapping[d.delegator].map((v) => v.gaugeId)
          ),
        { blockTag: blockTag }
      )
    )
  }, [allAllocsArray, delegatorVotesData, uwLockVoting, provider, activeNetwork.chainId])

  return (
    <>
      <DelegatorSelectionModal
        show={showDelegatorSelectionModal}
        handleClose={() => setShowDelegatorSelectionModal(false)}
        onClick={addEmptyVote}
      />
      <Flex col itemsCenter gap={15}>
        <ShadowDiv>
          <Flex gap={12} p={10}>
            <Flex col itemsCenter width={126}>
              <Text techygradient t6s>
                Total Points
              </Text>
              <Text techygradient big3>
                {truncateValue(formatUnits(totalVotePower, 18), 2)}
              </Text>
            </Flex>
          </Flex>
        </ShadowDiv>
        <Accordion isOpen={allAllocsArray.length > 0} thinScrollbar>
          <Flex col gap={10} p={10}>
            {allAllocsArray.map((voteAllocData, i) => (
              <DelegatorVoteGauge key={i} voteAllocData={voteAllocData} />
            ))}
          </Flex>
        </Accordion>
        {isVotingOpen ? (
          <>
            <Button onClick={() => setShowDelegatorSelectionModal(true)}>+ Add Gauge Vote</Button>
            <Button
              techygradient
              secondary
              noborder
              widthP={100}
              disabled={
                cannotCallVoteMultiple ||
                allAllocsArray.filter((item) => item.changed).length == 0 ||
                (delegatorVotesData.length == 0 ? 0 : totalAllocatedVotePower / delegatorVotesData.length) > 100
              }
              onClick={callVoteMultiple}
            >
              Set Votes
            </Button>
            {allAllocsArray.filter((item) => !item.added).length > 0 && (
              <Button error widthP={100} onClick={callRemoveVoteMultiple}>
                Remove all votes
              </Button>
            )}
          </>
        ) : (
          <Text italics>Voting is closed</Text>
        )}
      </Flex>
    </>
  )
}
