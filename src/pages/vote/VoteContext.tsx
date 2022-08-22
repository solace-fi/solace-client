import useDebounce from '@rooks/use-debounce'
import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'ethers/lib/utils'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GaugeSelectionModal } from '../../components/organisms/GaugeSelectionModal'
import { DelegateVotesData, GaugeData, VoteAllocation, VotesData } from '../../constants/types'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useGaugeControllerHelper } from '../../hooks/gauge/useGaugeController'
import { useUwLockVoting, useUwLockVotingHelper } from '../../hooks/lock/useUwLockVoting'
import { filterAmount, formatAmount } from '../../utils/formatting'

type VoteContextType = {
  intrface: {
    gaugesLoading: boolean
  }
  gauges: {
    gaugesData: GaugeData[]
    handleGaugeSelectionModal: (index: number) => void
  }
  voteGeneral: {
    isVotingOpen: boolean
    onVoteInput: (input: string, index: number, isOwner: boolean) => void
    deleteVote: (index: number, isOwner: boolean) => void
    addEmptyVote: (isOwner: boolean) => void
    assign: (gaugeName: string, gaugeId: BigNumber, index: number, isOwner: boolean) => void
  }
  voteOwner: {
    delegate: string
    votesData: VotesData
    handleDelegateAddress: (address: string) => void
    handleVotesData: (votesData: VotesData) => void
  }
  voteDelegator: {
    delegator: string
    delegatorVotesData: DelegateVotesData
    handleDelegatorAddress: (address: string) => void
    handleDelegatorVotesData: (votesData: DelegateVotesData) => void
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
  voteDelegator: {
    delegator: '',
    delegatorVotesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationTotal: 0,
      matching: false,
    },
    handleDelegatorAddress: () => undefined,
    handleDelegatorVotesData: () => undefined,
  },
})

const VoteManager: React.FC = (props) => {
  const { loading: gaugesLoading, gaugesData } = useGaugeControllerHelper()

  const { isVotingOpen: checkIfVotingIsOpen } = useUwLockVoting()
  const { getVoteInformation } = useUwLockVotingHelper()
  const { version } = useCachedData()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { latestBlock } = useProvider()
  const [isVotingOpen, setIsVotingOpen] = useState(true)
  const [openGaugeSelectionModal, setOpenGaugeSelectionModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined)
  const [delegatorAddr, setDelegatorAddr] = useState('')
  const [delegateAddr, setDelegateAddr] = useState('')

  const [votesData, setVotesData] = useState<VotesData>({
    votePower: ZERO,
    usedVotePowerBPS: ZERO,
    localVoteAllocation: [],
    localVoteAllocationTotal: 0,
  })
  const [delegatorVotesData, setDelegatorVotesData] = useState<DelegateVotesData>({
    votePower: ZERO,
    usedVotePowerBPS: ZERO,
    localVoteAllocation: [],
    localVoteAllocationTotal: 0,
    matching: false,
  })

  const handleVotesData = useCallback((votesData: VotesData) => {
    setVotesData(votesData)
  }, [])

  const handleDelegateAddress = useCallback((address: string) => {
    setDelegateAddr(address)
  }, [])

  const handleDelegatorAddress = useCallback((address: string) => {
    setDelegatorAddr(address)
  }, [])

  const handleDelegatorVotesData = useCallback((votesData: DelegateVotesData) => {
    setDelegatorVotesData(votesData)
  }, [])

  const onVoteInput = useCallback(
    (input: string, index: number, isOwner: boolean) => {
      if (isOwner) {
        const filtered = filterAmount(input, votesData.localVoteAllocation[index].votePowerPercentage)
        const formatted: string = formatAmount(filtered)
        if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return
        if (parseFloat(formatted) > 100) return

        setVotesData((prevState) => {
          const _new = [
            ...prevState.localVoteAllocation.slice(0, index),
            {
              ...prevState.localVoteAllocation[index],
              votePowerPercentage: filtered,
              changed: true,
            },
            ...prevState.localVoteAllocation.slice(index + 1),
          ]
          return {
            ...prevState,
            localVoteAllocation: _new,
            localVoteAllocationTotal: _new.reduce((acc, curr) => acc + parseFloat(curr.votePowerPercentage), 0),
          }
        })
      } else {
        const filtered = filterAmount(input, delegatorVotesData.localVoteAllocation[index].votePowerPercentage)
        if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return
        const formatted: string = formatAmount(filtered)
        if (parseFloat(formatted) > 100) return
        setDelegatorVotesData((prevState) => {
          const _new = [
            ...prevState.localVoteAllocation.slice(0, index),
            {
              ...prevState.localVoteAllocation[index],
              votePowerPercentage: filtered,
              changed: true,
            },
            ...prevState.localVoteAllocation.slice(index + 1),
          ]
          return {
            ...prevState,
            localVoteAllocation: _new,
            localVoteAllocationTotal: _new.reduce((acc, curr) => acc + parseFloat(curr.votePowerPercentage), 0),
          }
        })
      }
    },
    [delegatorVotesData, votesData]
  )

  const deleteVote = useCallback(
    (index: number, isOwner: boolean) => {
      if (isOwner) {
        setVotesData((prevState) => {
          const filtered = votesData.localVoteAllocation.filter((voteData, i) => i !== index)
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
          const filtered = delegatorVotesData.localVoteAllocation.filter((voteData, i) => i !== index)
          return {
            ...prevState,
            localVoteAllocation: filtered,
            localVoteAllocationTotal: filtered.reduce((acc, curr) => {
              return acc + parseFloat(curr.votePowerPercentage)
            }, 0),
          }
        })
      }
    },
    [delegatorVotesData, votesData]
  )

  const addEmptyVote = useCallback(
    (isOwner: boolean) => {
      if (isOwner) {
        const newVotesData = {
          ...votesData,
          localVoteAllocation: [
            ...votesData.localVoteAllocation,
            { gauge: '', gaugeId: ZERO, votePowerPercentage: '', added: true, changed: false, gaugeActive: false },
          ],
        }
        setVotesData({
          ...newVotesData,
          localVoteAllocationTotal: newVotesData.localVoteAllocation.reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
        })
      } else {
        const newVotesData = {
          ...delegatorVotesData,
          localVoteAllocation: [
            ...delegatorVotesData.localVoteAllocation,
            { gauge: '', gaugeId: ZERO, votePowerPercentage: '', added: true, changed: false, gaugeActive: false },
          ],
        }
        setDelegatorVotesData({
          ...newVotesData,
          localVoteAllocationTotal: newVotesData.localVoteAllocation.reduce((acc, curr) => {
            return acc + parseFloat(curr.votePowerPercentage)
          }, 0),
        })
      }
    },
    [votesData, delegatorVotesData]
  )

  const assign = useCallback(
    (gaugeName: string, gaugeId: BigNumber, index: number, isOwner: boolean) => {
      if (isOwner) {
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
      }
    },
    [gaugesData]
  )

  const handleGaugeSelectionModal = useCallback(
    (index: number) => {
      const resultingToggle = !openGaugeSelectionModal
      if (resultingToggle) {
        setEditingIndex(index)
      } else {
        setEditingIndex(undefined)
      }
      setOpenGaugeSelectionModal(resultingToggle)
    },
    [openGaugeSelectionModal]
  )

  const queryDelegator = useDebounce(async () => {
    if (!isAddress(delegatorAddr) || !account) {
      handleDelegatorVotesData({
        votePower: ZERO,
        usedVotePowerBPS: ZERO,
        localVoteAllocation: [],
        localVoteAllocationTotal: 0,
        matching: false,
      })
      return
    }
    const delegatorVoteInfo = await getVoteInformation(delegatorAddr)

    // unaccepted if this person's delegate is not the current account
    if (delegatorVoteInfo.delegate.toLowerCase() != account.toLowerCase()) {
      handleDelegatorVotesData({
        votePower: ZERO,
        usedVotePowerBPS: ZERO,
        localVoteAllocation: [],
        localVoteAllocationTotal: 0,
        matching: false,
      })
      return
    }
    const formattedDelegatorVotesData = delegatorVoteInfo.votes.map((item) => {
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

    handleDelegatorVotesData({
      votePower: delegatorVoteInfo.votePower,
      usedVotePowerBPS: delegatorVoteInfo.usedVotePowerBPS,
      localVoteAllocation: formattedDelegatorVotesData,
      localVoteAllocationTotal: formattedDelegatorVotesData.reduce((acc, curr) => {
        return acc + parseFloat(curr.votePowerPercentage)
      }, 0),
      matching: true,
    })
  }, 300)

  // mounting fetch (account switch or activenetwork switch) and version
  useEffect(() => {
    const getUserVotesData = async () => {
      if (!account || gaugesData.length == 0) {
        handleVotesData({
          votePower: ZERO,
          usedVotePowerBPS: ZERO,
          localVoteAllocation: [],
          localVoteAllocationTotal: 0,
        })
        return
      }
      console.log('fetching user votes data')

      // fetch this current user's vote information and organize state
      const userVoteInfo = await getVoteInformation(account)
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
  }, [account, gaugesData.length, activeNetwork, version])

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

  useEffect(() => {
    queryDelegator()
  }, [delegatorAddr, queryDelegator])

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
      voteDelegator: {
        delegator: delegatorAddr,
        handleDelegatorAddress,
        delegatorVotesData,
        handleDelegatorVotesData,
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
      handleDelegatorVotesData,
      handleGaugeSelectionModal,
      delegatorAddr,
      handleDelegatorAddress,
      delegateAddr,
      handleDelegateAddress,
    ]
  )

  return (
    <VoteContext.Provider value={value}>
      <GaugeSelectionModal
        show={openGaugeSelectionModal}
        index={editingIndex ?? 0}
        gaugesData={gaugesData}
        votesAllocationData={votesData.localVoteAllocation}
        handleCloseModal={() => handleGaugeSelectionModal(editingIndex ?? 0)}
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
