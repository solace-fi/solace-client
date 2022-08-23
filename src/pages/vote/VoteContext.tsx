import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GaugeSelectionModal } from '../../components/organisms/GaugeSelectionModal'
import { DelegateVotesData, GaugeData, VoteAllocation, VotesData } from '../../constants/types'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useGaugeControllerHelper } from '../../hooks/gauge/useGaugeController'
import { useUwLockVoting, useUwLockVotingHelper } from '../../hooks/lock/useUwLockVoting'
import { filterAmount, formatAmount } from '../../utils/formatting'
import { useContracts } from '../../context/ContractsManager'

type VoteContextType = {
  intrface: {
    gaugesLoading: boolean
  }
  gauges: {
    gaugesData: GaugeData[]
    handleGaugeSelectionModal: (index: number, delegator?: string) => void
  }
  voteGeneral: {
    isVotingOpen: boolean
    onVoteInput: (input: string, index: number, delegator?: string) => void
    deleteVote: (index: number, delegator?: string) => void
    addEmptyVote: (delegator?: string) => void
    assign: (gaugeName: string, gaugeId: BigNumber, index: number, delegator?: string) => void
  }
  voteOwner: {
    delegate: string
    votesData: VotesData
    handleDelegateAddress: (address: string) => void
    handleVotesData: (votesData: VotesData) => void
  }
  voteDelegators: {
    delegatorVotesData: DelegateVotesData[]
  }
}

const VoteContext = createContext<VoteContextType>({
  intrface: {
    gaugesLoading: false,
  },
  gauges: {
    gaugesData: [],
    handleGaugeSelectionModal: () => undefined,
  },
  voteGeneral: {
    isVotingOpen: false,
    onVoteInput: () => undefined,
    deleteVote: () => undefined,
    addEmptyVote: () => undefined,
    assign: () => undefined,
  },
  voteOwner: {
    delegate: '',
    votesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationTotal: 0,
    },
    handleDelegateAddress: () => undefined,
    handleVotesData: () => undefined,
  },
  voteDelegators: {
    delegatorVotesData: [],
  },
})

const VoteManager: React.FC = (props) => {
  const { loading: gaugesLoading, gaugesData } = useGaugeControllerHelper()
  const { keyContracts } = useContracts()
  const { uwLockVoting } = keyContracts

  const { isVotingOpen: checkIfVotingIsOpen } = useUwLockVoting()
  const { getDelegators, getVoteInformation } = useUwLockVotingHelper()
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
  const [delegateAddr, setDelegateAddr] = useState('')

  const [votesData, setVotesData] = useState<VotesData>({
    votePower: ZERO,
    usedVotePowerBPS: ZERO,
    localVoteAllocation: [],
    localVoteAllocationTotal: 0,
  })
  const [delegatorVotesData, setDelegatorVotesData] = useState<DelegateVotesData[]>([])

  const [selectedLockOwner, setSelectedLockOwner] = useState<VotesData | undefined>(undefined)

  const handleVotesData = useCallback((votesData: VotesData) => {
    setVotesData(votesData)
  }, [])

  const handleDelegateAddress = useCallback((address: string) => {
    setDelegateAddr(address)
  }, [])

  const handleDelegatorVotesData = useCallback((data: DelegateVotesData[]) => {
    setDelegatorVotesData(data)
  }, [])

  const onVoteInput = useCallback((input: string, index: number, delegator?: string) => {
    if (!delegator) {
      setVotesData((prevState) => {
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
          localVoteAllocationTotal: newAlloc.reduce((acc, curr) => acc + parseFloat(curr.votePowerPercentage), 0),
        }
      })
    } else {
      setDelegatorVotesData((prevState) => {
        return prevState.map((data) => {
          if (data.delegator == delegator) {
            const newAlloc = data.localVoteAllocation.map((alloc, i) => {
              if (i == index) {
                const filtered = filterAmount(input, alloc.votePowerPercentage)
                const formatted: string = formatAmount(filtered)
                if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return alloc
                if (parseFloat(formatted) > 100) return alloc
                return {
                  ...alloc,
                  votePowerPercentage: filtered,
                  changed: true,
                }
              }
              return alloc
            })

            return {
              ...data,
              localVoteAllocation: newAlloc,
              localVoteAllocationTotal: newAlloc.reduce((acc, curr) => acc + parseFloat(curr.votePowerPercentage), 0),
            }
          }
          return data
        })
      })
    }
  }, [])

  const deleteVote = useCallback((index: number, delegator?: string) => {
    if (!delegator) {
      setVotesData((prevState) => {
        const filtered = prevState.localVoteAllocation.filter((voteData, i) => i !== index)
        return {
          ...prevState,
          localVoteAllocation: filtered,
          localVoteAllocationTotal: filtered.reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
        }
      })
    } else {
      setDelegatorVotesData((prevState) => {
        return prevState.map((data) => {
          if (data.delegator === delegator) {
            const filtered = data.localVoteAllocation.filter((voteData, i) => i !== index)
            return {
              ...data,
              localVoteAllocation: filtered,
              localVoteAllocationTotal: filtered.reduce((acc, curr) => {
                return acc + parseFloat(curr.votePowerPercentage)
              }, 0),
            }
          }
          return data
        })
      })
    }
  }, [])

  const addEmptyVote = useCallback((delegator?: string) => {
    if (!delegator) {
      setVotesData((prevState) => {
        return {
          ...prevState,
          localVoteAllocation: [
            ...prevState.localVoteAllocation,
            { gauge: '', gaugeId: ZERO, votePowerPercentage: '', added: true, changed: false, gaugeActive: false },
          ],
        }
      })
    } else {
      setDelegatorVotesData((prevState) => {
        return prevState.map((data) => {
          if (data.delegator === delegator) {
            return {
              ...data,
              localVoteAllocation: [
                ...data.localVoteAllocation,
                {
                  gauge: '',
                  gaugeId: ZERO,
                  votePowerPercentage: '',
                  added: true,
                  changed: false,
                  gaugeActive: false,
                },
              ],
            }
          }
          return data
        })
      })
    }
  }, [])

  const assign = useCallback(
    (gaugeName: string, gaugeId: BigNumber, index: number, delegator?: string) => {
      if (!delegator) {
        setVotesData((prevState) => {
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
                  gaugeActive: gaugesData.find((item) => item.gaugeId.eq(gaugeId))?.isActive ?? false,
                }
              }
              return vote
            }),
          }
        })
      } else {
        setDelegatorVotesData((prevState) => {
          return prevState.map((data) => {
            if (data.delegator === delegator) {
              return {
                ...data,
                localVoteAllocation: data.localVoteAllocation.map((vote, i) => {
                  if (i == index) {
                    if (vote.gauge === gaugeName && vote.gaugeId.eq(gaugeId)) return vote
                    return {
                      ...vote,
                      gauge: gaugeName,
                      gaugeId: gaugeId,
                      changed: true,
                      gaugeActive: gaugesData.find((item) => item.gaugeId.eq(gaugeId))?.isActive ?? false,
                    }
                  }
                  return vote
                }),
              }
            }
            return data
          })
        })
      }
    },
    [gaugesData]
  )

  const handleGaugeSelectionModal = useCallback(
    (index?: number, delegator?: string) => {
      setEditingGaugeSelection({
        index,
        delegator,
      })
      if (index !== undefined) {
        setSelectedLockOwner(delegator ? delegatorVotesData.find((data) => data.delegator === delegator) : votesData)
        setOpenGaugeSelectionModal(true)
      } else {
        setSelectedLockOwner(undefined)
        setOpenGaugeSelectionModal(false)
      }
    },
    [votesData, delegatorVotesData]
  )

  // mounting fetch (account switch or activenetwork switch) and version
  useEffect(() => {
    const getUserVotesData = async () => {
      if (!account || gaugesData.length == 0 || !uwLockVoting) {
        handleVotesData({
          votePower: ZERO,
          usedVotePowerBPS: ZERO,
          localVoteAllocation: [],
          localVoteAllocationTotal: 0,
        })
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
          const foundGauge = gaugesData.find((g) => g.gaugeId.eq(item.gaugeID))
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
        const res: DelegateVotesData = {
          votePower: item.votePower,
          usedVotePowerBPS: item.usedVotePowerBPS,
          localVoteAllocation: formattedDelegatorVotesData[i],
          localVoteAllocationTotal: formattedDelegatorVotesData[i].reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
          delegator: _delegators[i],
        }
        return res
      })
      handleDelegatorVotesData(newDelegatorsVoteData)

      const formattedUserVotesData = userVoteInfo.votes.map((item) => {
        const foundGauge = gaugesData.find((g) => g.gaugeId.eq(item.gaugeID))
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
        localVoteAllocationTotal: formattedUserVotesData.reduce((acc, curr) => {
          return acc + parseFloat(curr.votePowerPercentage)
        }, 0),
      }

      handleDelegateAddress(userVoteInfo.delegate)
      handleVotesData(newVotesData)
    }
    getUserVotesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, gaugesData.length, activeNetwork, positiveVersion])

  // latestBlock fetch
  useEffect(() => {
    const updateActiveness = async () => {
      const s = votesData.localVoteAllocation.map((item) => {
        const foundGauge = gaugesData.find((g) => g.gaugeId.eq(item.gaugeId))
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
      handleVotesData(newVotesData)
    }
    if (gaugesData.length == 0) return
    updateActiveness()
  }, [latestBlock])

  useEffect(() => {
    const callVotingOpen = async () => {
      const res = await checkIfVotingIsOpen()
      setIsVotingOpen(res)
    }
    callVotingOpen()
  }, [activeNetwork, latestBlock])

  // useEffect(() => {
  //   queryDelegator()
  // }, [delegatorAddr, queryDelegator])

  const value = useMemo<VoteContextType>(
    () => ({
      intrface: {
        gaugesLoading,
      },
      gauges: {
        gaugesData,
        handleGaugeSelectionModal,
      },
      voteGeneral: {
        isVotingOpen,
        assign,
        addEmptyVote,
        onVoteInput,
        deleteVote,
      },
      voteOwner: {
        delegate: delegateAddr,
        votesData,
        handleDelegateAddress,
        handleVotesData,
      },
      voteDelegators: {
        delegatorVotesData,
      },
    }),
    [
      gaugesData,
      gaugesLoading,
      isVotingOpen,
      assign,
      addEmptyVote,
      onVoteInput,
      deleteVote,
      votesData,
      handleVotesData,
      delegatorVotesData,
      handleGaugeSelectionModal,
      delegateAddr,
      handleDelegateAddress,
    ]
  )

  return (
    <VoteContext.Provider value={value}>
      <GaugeSelectionModal
        show={openGaugeSelectionModal}
        target={editingGaugeSelection}
        gaugesData={gaugesData}
        votesAllocationData={selectedLockOwner?.localVoteAllocation ?? []}
        handleCloseModal={() => handleGaugeSelectionModal(undefined, undefined)}
        assign={assign}
      />
      {props.children}
    </VoteContext.Provider>
  )
}

export function useVoteContext(): VoteContextType {
  return useContext(VoteContext)
}

export default VoteManager
