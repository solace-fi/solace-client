import { BigNumber, ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GaugeSelectionModal } from '../../components/organisms/GaugeSelectionModal'
import { DelegatorVotesData, GaugeData, VoteAllocation, VotesData } from '../../constants/types'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useGaugeControllerHelper } from '../../hooks/gauge/useGaugeController'
import { useUwLockVoting, useUwLockVotingHelper } from '../../hooks/lock/useUwLockVoting'
import { filterAmount, formatAmount } from '../../utils/formatting'
import { useContracts } from '../../context/ContractsManager'
import { DelegateModal } from './organisms/DelegateModal'
import { useEpochTimer } from '../../hooks/native/useEpochTimer'

type VoteContextType = {
  intrface: {
    gaugesLoading: boolean
  }
  gauges: {
    currentGaugesData: GaugeData[]
    nextGaugesData: GaugeData[]
    insuranceCapacity: number
    leverageFactor: number
    handleGaugeSelectionModal: (index: number, delegator?: string) => void
  }
  delegateData: {
    delegate: string
    delegateModalOpen: boolean
    handleDelegateModalOpen: (value: boolean) => void
  }
  voteGeneral: {
    isVotingOpen: boolean
    onVoteInput: (input: string, index: number, isOwner: boolean) => void
    deleteVote: (index: number, isOwner: boolean) => void
    addEmptyVote: (isOwner: boolean) => void
    assign: (gaugeName: string, gaugeId: BigNumber, index: number, isOwner: boolean) => void
    epochEnd: {
      epochEndTimestamp?: BigNumber
      remainingTime: {
        days: number
        hours: number
        minutes: number
        seconds: number
      }
    }
  }
  voteOwner: {
    votesData: VotesData
    editingVotesData: VotesData
    handleEditingVotesData: (votesData: VotesData) => void
  }
  voteDelegators: {
    delegatorVotesData: DelegatorVotesData[]
    editingDelegatorVotesData: DelegatorVotesData
    handleDelegatorVotesData: (data: DelegatorVotesData[]) => void
    handleEditingDelegatorVotesData: (data: DelegatorVotesData) => void
  }
}

const VoteContext = createContext<VoteContextType>({
  intrface: {
    gaugesLoading: false,
  },
  gauges: {
    currentGaugesData: [],
    nextGaugesData: [],
    insuranceCapacity: 0,
    leverageFactor: 0,
    handleGaugeSelectionModal: () => undefined,
  },
  delegateData: {
    delegate: ZERO_ADDRESS,
    delegateModalOpen: false,
    handleDelegateModalOpen: () => undefined,
  },
  voteGeneral: {
    isVotingOpen: false,
    onVoteInput: () => undefined,
    deleteVote: () => undefined,
    addEmptyVote: () => undefined,
    assign: () => undefined,
    epochEnd: {
      epochEndTimestamp: undefined,
      remainingTime: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    },
  },
  voteOwner: {
    votesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationPercentageTotal: 0,
    },
    editingVotesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationPercentageTotal: 0,
    },
    handleEditingVotesData: () => undefined,
  },
  voteDelegators: {
    delegatorVotesData: [],
    editingDelegatorVotesData: {
      delegator: '',
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocation: [],
      localVoteAllocationPercentageTotal: 0,
    },
    handleEditingDelegatorVotesData: () => undefined,
    handleDelegatorVotesData: () => undefined,
  },
})

const VoteManager: React.FC = (props) => {
  const {
    loading: gaugesLoading,
    currentGaugesData,
    nextGaugesData,
    insuranceCapacity,
    leverageFactor,
  } = useGaugeControllerHelper()
  const { keyContracts } = useContracts()
  const { uwLockVoting } = keyContracts

  const { isVotingOpen: checkIfVotingIsOpen, delegateOf, getVotingDelegatorsOf: getDelegators } = useUwLockVoting()
  const { getVoteInformation } = useUwLockVotingHelper()
  const { remainingTime, epochEndTimestamp } = useEpochTimer()
  const { positiveVersion } = useCachedData()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { latestBlock } = useProvider()
  const [isVotingOpen, setIsVotingOpen] = useState(true)
  const [openGaugeSelectionModal, setOpenGaugeSelectionModal] = useState(false)
  const [editingGaugeSelection, setEditingGaugeSelection] = useState<{ index?: number; delegator?: string }>({
    index: undefined,
    delegator: undefined,
  })
  const [votesData, setVotesData] = useState<VotesData>({
    votePower: ZERO,
    usedVotePowerBPS: ZERO,
    localVoteAllocation: [],
    localVoteAllocationPercentageTotal: 0,
  })
  const [editingVotesData, setEditingVotesData] = useState<VotesData>(votesData)

  const [editingDelegatorVotesData, setEditingDelegatorVotesData] = useState<DelegatorVotesData>({
    delegator: '',
    votePower: ZERO,
    usedVotePowerBPS: ZERO,
    localVoteAllocation: [],
    localVoteAllocationPercentageTotal: 0,
  })
  const [delegatorVotesData, setDelegatorVotesData] = useState<DelegatorVotesData[]>([])

  const [currentDelegate, setCurrentDelegate] = useState(ZERO_ADDRESS)
  const [delegateModalOpen, setDelegateModalOpen] = useState(false)

  const handleDelegatorVotesData = useCallback((data: DelegatorVotesData[]) => {
    setDelegatorVotesData(data)
  }, [])

  const handleEditingDelegatorVotesData = useCallback((data: DelegatorVotesData) => {
    setEditingDelegatorVotesData(data)
  }, [])

  const handleEditingVotesData = useCallback((data: VotesData) => {
    setEditingVotesData(data)
  }, [])

  const handleDelegateModalOpen = useCallback((value: boolean) => {
    setDelegateModalOpen(value)
  }, [])

  const onVoteInput = useCallback((input: string, index: number, isOwner: boolean) => {
    if (isOwner) {
      setEditingVotesData((prevState) => {
        const newAlloc = prevState.localVoteAllocation.map((data, i) => {
          if (i == index) {
            const filtered = filterAmount(input, data.votePowerPercentage)
            const formatted: string = formatAmount(filtered)
            if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return data
            if (parseFloat(formatted) > 100) return data
            return {
              ...data,
              votePowerPercentage: filtered,
              changed: true,
            }
          }
          return data
        })
        return {
          ...prevState,
          localVoteAllocation: newAlloc,
          localVoteAllocationPercentageTotal: newAlloc.reduce(
            (acc, curr) => acc + parseFloat(curr.votePowerPercentage),
            0
          ),
        }
      })
    } else {
      setEditingDelegatorVotesData((prevState) => {
        const newAlloc = prevState.localVoteAllocation.map((data, i) => {
          if (i == index) {
            const filtered = filterAmount(input, data.votePowerPercentage)
            const formatted: string = formatAmount(filtered)
            if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return data
            if (parseFloat(formatted) > 100) return data
            return {
              ...data,
              votePowerPercentage: filtered,
              changed: true,
            }
          }
          return data
        })
        return {
          ...prevState,
          localVoteAllocation: newAlloc,
          localVoteAllocationPercentageTotal: newAlloc.reduce(
            (acc, curr) => acc + parseFloat(curr.votePowerPercentage),
            0
          ),
        }
      })
    }
  }, [])

  const deleteVote = useCallback((index: number, isOwner: boolean) => {
    if (isOwner) {
      setEditingVotesData((prevState) => {
        const filtered = prevState.localVoteAllocation.filter((voteData, i) => i !== index)
        return {
          ...prevState,
          localVoteAllocation: filtered,
          localVoteAllocationPercentageTotal: filtered.reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
        }
      })
    } else {
      setEditingDelegatorVotesData((prevState) => {
        const filtered = prevState.localVoteAllocation.filter((voteData, i) => i !== index)
        return {
          ...prevState,
          localVoteAllocation: filtered,
          localVoteAllocationPercentageTotal: filtered.reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
        }
      })
    }
  }, [])

  const addEmptyVote = useCallback((isOwner: boolean) => {
    if (isOwner) {
      setEditingVotesData((prevState) => {
        return {
          ...prevState,
          localVoteAllocation: [
            ...prevState.localVoteAllocation,
            { gauge: '', gaugeId: ZERO, votePowerPercentage: '', added: true, changed: false, gaugeActive: false },
          ],
        }
      })
    } else {
      setEditingDelegatorVotesData((prevState) => {
        return {
          ...prevState,
          localVoteAllocation: [
            ...prevState.localVoteAllocation,
            { gauge: '', gaugeId: ZERO, votePowerPercentage: '', added: true, changed: false, gaugeActive: false },
          ],
        }
      })
    }
  }, [])

  const assign = useCallback(
    (gaugeName: string, gaugeId: BigNumber, index: number, isOwner: boolean) => {
      if (isOwner) {
        setEditingVotesData((prevState) => {
          return {
            ...prevState,
            localVoteAllocation: prevState.localVoteAllocation.map((vote, i) => {
              if (i == index) {
                if (vote.gauge === gaugeName && vote.gaugeId.eq(gaugeId)) return vote
                return {
                  ...vote,
                  gauge: gaugeName,
                  gaugeId: gaugeId,
                  changed: true,
                  gaugeActive: currentGaugesData.find((item) => item.gaugeId.eq(gaugeId))?.isActive ?? false,
                }
              }
              return vote
            }),
          }
        })
      } else {
        setEditingDelegatorVotesData((prevState) => {
          return {
            ...prevState,
            localVoteAllocation: prevState.localVoteAllocation.map((vote, i) => {
              if (i == index) {
                if (vote.gauge === gaugeName && vote.gaugeId.eq(gaugeId)) return vote
                return {
                  ...vote,
                  gauge: gaugeName,
                  gaugeId: gaugeId,
                  changed: true,
                  gaugeActive: currentGaugesData.find((item) => item.gaugeId.eq(gaugeId))?.isActive ?? false,
                }
              }
              return vote
            }),
          }
        })
      }
    },
    [currentGaugesData]
  )

  const handleGaugeSelectionModal = useCallback((index?: number, delegator?: string) => {
    setEditingGaugeSelection({
      index,
      delegator,
    })
    setOpenGaugeSelectionModal(index !== undefined)
  }, [])

  // mounting fetch (account switch or activenetwork switch) and version
  useEffect(() => {
    const getUserVotesData = async () => {
      if (!account || currentGaugesData.length == 0 || !uwLockVoting) {
        const res = {
          votePower: ZERO,
          usedVotePowerBPS: ZERO,
          localVoteAllocation: [],
          localVoteAllocationPercentageTotal: 0,
        }
        setVotesData(res)
        setEditingVotesData(res)
        return
      }

      // fetch this current user's vote information and organize state
      const userVoteInfo = await getVoteInformation(account)
      const _delegators = await getDelegators(account)

      const delegatorsVotesData = await Promise.all(_delegators.map(async (delegator) => getVoteInformation(delegator)))
      const formattedDelegatorVotesData: VoteAllocation[][] = []

      for (let i = 0; i < delegatorsVotesData.length; i++) {
        const delegatorVoteInfo = delegatorsVotesData[i]
        const formattedDelegatorVotesDataItem = delegatorVoteInfo.votes.map((item) => {
          const foundGauge = currentGaugesData.find((g) => g.gaugeId.eq(item.gaugeID))
          const name = foundGauge?.gaugeName ?? ''
          const active = foundGauge?.isActive ?? false
          return {
            gauge: name,
            votePowerPercentage: (parseFloat(item.votePowerBPS.toString()) / 100).toString(), // e.g. 9988 => '99.88'
            gaugeId: item.gaugeID,
            added: false,
            changed: false,
            gaugeActive: active,
          }
        })
        formattedDelegatorVotesData.push(formattedDelegatorVotesDataItem)
      }

      const newDelegatorsVoteData = delegatorsVotesData.map((item, i) => {
        const res: DelegatorVotesData = {
          votePower: item.votePower,
          usedVotePowerBPS: item.usedVotePowerBPS,
          localVoteAllocation: formattedDelegatorVotesData[i],
          localVoteAllocationPercentageTotal: formattedDelegatorVotesData[i].reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
          delegator: _delegators[i],
        }
        return res
      })
      handleDelegatorVotesData(newDelegatorsVoteData)
      setEditingDelegatorVotesData(
        newDelegatorsVoteData.find((item) => item.delegator == editingDelegatorVotesData.delegator) ?? {
          votePower: ZERO,
          usedVotePowerBPS: ZERO,
          localVoteAllocation: [],
          localVoteAllocationPercentageTotal: 0,
          delegator: '',
        }
      )

      const formattedUserVotesData = userVoteInfo.votes.map((item) => {
        const foundGauge = currentGaugesData.find((g) => g.gaugeId.eq(item.gaugeID))
        const name = foundGauge?.gaugeName ?? ''
        const isActive = foundGauge?.isActive ?? false
        const alloc: VoteAllocation = {
          gauge: name,
          votePowerPercentage: (parseFloat(item.votePowerBPS.toString()) / 100).toString(), // e.g. 9988 => '99.88'
          gaugeId: item.gaugeID,
          added: false,
          changed: false,
          gaugeActive: isActive,
        }
        return alloc
      })

      // add allocation into votesData and calculate allocation total
      const newVotesData = {
        votePower: userVoteInfo.votePower,
        usedVotePowerBPS: userVoteInfo.usedVotePowerBPS,
        localVoteAllocation: formattedUserVotesData,
        localVoteAllocationPercentageTotal: formattedUserVotesData.reduce((acc, curr) => {
          return acc + parseFloat(curr.votePowerPercentage)
        }, 0),
      }

      setVotesData(newVotesData)
      setEditingVotesData(newVotesData)
    }
    getUserVotesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, currentGaugesData.length, activeNetwork, positiveVersion])

  // latestBlock fetch
  useEffect(() => {
    const updateActivenessOnEdit = async () => {
      const s = editingVotesData.localVoteAllocation.map((item) => {
        const foundGauge = currentGaugesData.find((g) => g.gaugeId.eq(item.gaugeId))
        const isActive = foundGauge?.isActive ?? false
        return {
          ...item,
          gaugeActive: isActive,
        }
      })

      const newVotesData = {
        ...votesData,
        localVoteAllocation: s,
      }
      setEditingVotesData(newVotesData)
    }
    if (currentGaugesData.length == 0) return
    updateActivenessOnEdit()
  }, [latestBlock])

  useEffect(() => {
    const callVotingOpen = async () => {
      const res = await checkIfVotingIsOpen()
      setIsVotingOpen(res)
    }
    callVotingOpen()
  }, [activeNetwork, latestBlock])

  useEffect(() => {
    const getMyDelegate = async () => {
      if (!account) {
        setCurrentDelegate(ZERO_ADDRESS)
        return
      }
      const delegate = await delegateOf(account)
      setCurrentDelegate(delegate)
    }
    getMyDelegate()
  }, [delegateOf, account, positiveVersion])

  const value = useMemo<VoteContextType>(
    () => ({
      intrface: {
        gaugesLoading,
      },
      gauges: {
        leverageFactor,
        insuranceCapacity,
        currentGaugesData,
        nextGaugesData,
        handleGaugeSelectionModal,
      },
      delegateData: {
        delegate: currentDelegate,
        delegateModalOpen,
        handleDelegateModalOpen,
      },
      voteGeneral: {
        isVotingOpen,
        assign,
        addEmptyVote,
        onVoteInput,
        deleteVote,
        epochEnd: {
          epochEndTimestamp,
          remainingTime,
        },
      },
      voteOwner: {
        votesData,
        editingVotesData,
        handleEditingVotesData,
      },
      voteDelegators: {
        delegatorVotesData,
        editingDelegatorVotesData,
        handleEditingDelegatorVotesData,
        handleDelegatorVotesData,
      },
    }),
    [
      currentGaugesData,
      nextGaugesData,
      gaugesLoading,
      isVotingOpen,
      assign,
      addEmptyVote,
      onVoteInput,
      deleteVote,
      votesData,
      delegatorVotesData,
      handleGaugeSelectionModal,
      handleDelegatorVotesData,
      editingDelegatorVotesData,
      handleEditingDelegatorVotesData,
      editingVotesData,
      currentDelegate,
      delegateModalOpen,
      handleDelegateModalOpen,
      insuranceCapacity,
      handleEditingVotesData,
      leverageFactor,
      epochEndTimestamp,
      remainingTime,
    ]
  )

  return (
    <VoteContext.Provider value={value}>
      <GaugeSelectionModal
        show={openGaugeSelectionModal}
        target={editingGaugeSelection}
        gaugesData={currentGaugesData}
        votesAllocationData={
          editingGaugeSelection.delegator !== undefined
            ? delegatorVotesData.find(
                (data) => data.delegator.toLowerCase() === editingGaugeSelection.delegator?.toLowerCase()
              )?.localVoteAllocation ?? []
            : votesData.localVoteAllocation
        }
        handleCloseModal={() => handleGaugeSelectionModal(undefined, undefined)}
        assign={assign}
      />
      <DelegateModal show={delegateModalOpen} handleCloseModal={() => handleDelegateModalOpen(false)} />
      {props.children}
    </VoteContext.Provider>
  )
}

export function useVoteContext(): VoteContextType {
  return useContext(VoteContext)
}

export default VoteManager
