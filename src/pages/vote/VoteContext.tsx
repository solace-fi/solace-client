import useDebounce from '@rooks/use-debounce'
import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'ethers/lib/utils'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, version } from 'react'
import { GaugeSelectionModal } from '../../components/organisms/GaugeSelectionModal'
import { GaugeData, VoteAllocation, VotesData } from '../../constants/types'
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
    votesData: VotesData
    handleVotesData: (votesData: VotesData) => void
  }
  voteDelegator: {
    delegator: string
    delegatorVotesData: VotesData
    handleDelegatorAddress: (address: string) => void
    handleDelegatorVotesData: (votesData: VotesData) => void
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
    votesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationTotal: 0,
    },
    handleVotesData: () => undefined,
  },
  voteDelegator: {
    delegator: '',
    delegatorVotesData: {
      localVoteAllocation: [],
      votePower: ZERO,
      usedVotePowerBPS: ZERO,
      localVoteAllocationTotal: 0,
    },
    handleDelegatorAddress: () => undefined,
    handleDelegatorVotesData: () => undefined,
  },
})

const VoteManager: React.FC = (props) => {
  const { loading: gaugesLoading, gaugesData } = useGaugeControllerHelper()
  const { isVotingOpen: checkIfVotingIsOpen } = useUwLockVoting()
  const { getVoteInformation } = useUwLockVotingHelper()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { latestBlock } = useProvider()
  const mounting = useRef(true)

  const [isVotingOpen, setIsVotingOpen] = useState(true)
  const [openGaugeSelectionModal, setOpenGaugeSelectionModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined)
  const [delegatorAddr, setDelegatorAddr] = useState('')

  const [votesData, setVotesData] = useState<VotesData>({
    votePower: ZERO,
    usedVotePowerBPS: ZERO,
    localVoteAllocation: [],
    localVoteAllocationTotal: 0,
  })
  const [delegatorVotesData, setDelegatorVotesData] = useState<VotesData>({
    votePower: ZERO,
    usedVotePowerBPS: ZERO,
    localVoteAllocation: [],
    localVoteAllocationTotal: 0,
  })

  const handleVotesData = useCallback((votesData: VotesData) => {
    setVotesData(votesData)
  }, [])

  const handleDelegatorAddress = useCallback((address: string) => {
    setDelegatorAddr(address)
  }, [])

  const handleDelegatorVotesData = useCallback((votesData: VotesData) => {
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
          return {
            ...prevState,
            localVoteAllocation: [
              ...prevState.localVoteAllocation.slice(0, index),
              {
                ...prevState.localVoteAllocation[index],
                votePowerPercentage: filtered,
                changed: true,
              },
              ...prevState.localVoteAllocation.slice(index + 1),
            ],
          }
        })
      } else {
        const filtered = filterAmount(input, delegatorVotesData.localVoteAllocation[index].votePowerPercentage)
        if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) return
        const formatted: string = formatAmount(filtered)
        if (parseFloat(formatted) > 100) return
        setDelegatorVotesData((prevState) => {
          return {
            ...prevState,
            localVoteAllocation: [
              ...prevState.localVoteAllocation.slice(0, index),
              {
                ...prevState.localVoteAllocation[index],
                votePowerPercentage: filtered,
                changed: true,
              },
              ...prevState.localVoteAllocation.slice(index + 1),
            ],
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
          return {
            ...prevState,
            localVoteAllocation: votesData.localVoteAllocation.filter((voteData, i) => i !== index),
          }
        })
      } else {
        setDelegatorVotesData((prevState) => {
          return {
            ...prevState,
            localVoteAllocation: delegatorVotesData.localVoteAllocation.filter((voteData, i) => i !== index),
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
        setVotesData(newVotesData)
      } else {
        const newVotesData = {
          ...delegatorVotesData,
          localVoteAllocation: [
            ...delegatorVotesData.localVoteAllocation,
            { gauge: '', gaugeId: ZERO, votePowerPercentage: '', added: true, changed: false, gaugeActive: false },
          ],
        }
        setDelegatorVotesData(newVotesData)
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
            localVoteAllocation: votesData.localVoteAllocation.map((vote, i) => {
              if (i == index) {
                return {
                  ...votesData.localVoteAllocation[i],
                  gauge: gaugeName,
                  gaugeId: gaugeId,
                  changed: true,
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
            localVoteAllocation: delegatorVotesData.localVoteAllocation.map((vote, i) => {
              if (i == index) {
                return {
                  ...delegatorVotesData.localVoteAllocation[i],
                  gauge: gaugeName,
                  gaugeId: gaugeId,
                  changed: true,
                }
              }
              return vote
            }),
          }
        })
      }
    },
    [votesData, delegatorVotesData]
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
      })
      return
    }
    const delegatorVoteInfo = await getVoteInformation(delegatorAddr)
    if (delegatorVoteInfo.delegate.toLowerCase() != account.toLowerCase()) {
      handleDelegatorVotesData({
        votePower: ZERO,
        usedVotePowerBPS: ZERO,
        localVoteAllocation: [],
        localVoteAllocationTotal: 0,
      })
      return
    }
    const formattedDelegatorVotesData = delegatorVoteInfo.votes.map((item) => {
      const foundGauge = gaugesData.find((g) => g.gaugeId === item.gaugeID)
      const name = foundGauge?.gaugeName ?? ''
      const active = foundGauge?.isActive ?? false
      return {
        gauge: name,
        votePowerPercentage: (parseFloat(item.votePowerBPS.toString()) / 100).toString(),
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
    })
  }, 300)

  useEffect(() => {
    const getUserVotesData = async () => {
      if (!account) {
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
      const formattedUserVotesData = userVoteInfo.votes.map((item) => {
        const foundGauge = gaugesData.find((g) => g.gaugeId === item.gaugeID)
        const name = foundGauge?.gaugeName ?? ''
        const active = foundGauge?.isActive ?? false
        const alloc: VoteAllocation = {
          gauge: name,
          votePowerPercentage: (parseFloat(item.votePowerBPS.toString()) / 100).toString(), // e.g. 9988 => '99.88'
          gaugeId: item.gaugeID,
          added: false,
          changed: false,
          gaugeActive: active,
        }
        return alloc
      })

      // create temp var based on current local allocations
      let newAllocation = votesData.localVoteAllocation
      if (mounting.current) {
        // if component is mounting, copy the entire fetched state over
        newAllocation = formattedUserVotesData
        mounting.current = false
      } else {
        // only update the activeness of current gauges
        for (let i = 0; i < newAllocation.length; i++) {
          const matchingGauge = gaugesData.find((g) => g.gaugeId === newAllocation[i].gaugeId)
          if (matchingGauge) {
            newAllocation[i] = {
              ...newAllocation[i],
              gaugeActive: matchingGauge.isActive,
            }
          }
        }
      }

      // add allocation into votesData and calculate allocation total
      const newVotesData = {
        votePower: userVoteInfo.votePower,
        usedVotePowerBPS: userVoteInfo.usedVotePowerBPS,
        localVoteAllocation: newAllocation,
        localVoteAllocationTotal: newAllocation.reduce((acc, curr) => {
          return acc + parseFloat(curr.votePowerPercentage)
        }, 0),
      }

      handleVotesData(newVotesData)
    }
    getUserVotesData()
  }, [account, gaugesData, activeNetwork, version])

  useEffect(() => {
    const callVotingOpen = async () => {
      const res = await checkIfVotingIsOpen()
      setIsVotingOpen(res)
    }
    // callVotingOpen()
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
        votesData,
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
