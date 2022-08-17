import useDebounce from '@rooks/use-debounce'
import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'ethers/lib/utils'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, version } from 'react'
import { GaugeSelectionModal } from '../../components/organisms/GaugeSelectionModal'
import { GaugeData, VoteAllocation, VotesData } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { useGaugeControllerHelper } from '../../hooks/gauge/useGaugeController'
import { useUwpLockVoting, useUwpLockVotingHelper } from '../../hooks/lock/useUwpLockVoting'
import { formatAmount } from '../../utils/formatting'

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
      voteAllocation: [],
      votePower: ZERO,
      usedVotePower: ZERO,
    },
    handleVotesData: () => undefined,
  },
  voteDelegator: {
    delegator: '',
    delegatorVotesData: {
      voteAllocation: [],
      votePower: ZERO,
      usedVotePower: ZERO,
    },
    handleDelegatorAddress: () => undefined,
    handleDelegatorVotesData: () => undefined,
  },
})

const VoteManager: React.FC = (props) => {
  const { loading: gaugesLoading, gaugesData } = useGaugeControllerHelper()
  const { isVotingOpen: checkIfVotingIsOpen } = useUwpLockVoting()
  const { getVoteInformation } = useUwpLockVotingHelper()
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const mounting = useRef(true)

  const [isVotingOpen, setIsVotingOpen] = useState(true)
  const [openGaugeSelectionModal, setOpenGaugeSelectionModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | undefined>(undefined)
  const [delegatorAddr, setDelegatorAddr] = useState('')

  const [votesData, setVotesData] = useState<VotesData>({
    votePower: ZERO,
    usedVotePower: ZERO,
    voteAllocation: [],
  })
  const [delegatorVotesData, setDelegatorVotesData] = useState<VotesData>({
    votePower: ZERO,
    usedVotePower: ZERO,
    voteAllocation: [],
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
      const formatted: string = formatAmount(input)

      if (isOwner) {
        if (formatted === votesData.voteAllocation[index].votes) return
        setVotesData((prevState) => {
          return {
            ...prevState,
            voteAllocation: [
              ...prevState.voteAllocation.slice(0, index),
              {
                ...prevState.voteAllocation[index],
                votes: input,
                changed: true,
              },
              ...prevState.voteAllocation.slice(index + 1),
            ],
          }
        })
      } else {
        if (formatted === delegatorVotesData.voteAllocation[index].votes) return
        setDelegatorVotesData((prevState) => {
          return {
            ...prevState,
            voteAllocation: [
              ...prevState.voteAllocation.slice(0, index),
              {
                ...prevState.voteAllocation[index],
                votes: input,
                changed: true,
              },
              ...prevState.voteAllocation.slice(index + 1),
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
        const newVoteAllocation = votesData.voteAllocation.filter((voteData, i) => i !== index)
        setVotesData((prevState) => {
          return { ...prevState, voteAllocation: newVoteAllocation }
        })
      } else {
        const newVoteAllocation = delegatorVotesData.voteAllocation.filter((voteData, i) => i !== index)
        setDelegatorVotesData((prevState) => {
          return { ...prevState, voteAllocation: newVoteAllocation }
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
          voteAllocation: [
            ...votesData.voteAllocation,
            { gauge: '', gaugeId: ZERO, votes: '0', added: true, changed: false, gaugeActive: false },
          ],
        }
        setVotesData(newVotesData)
      } else {
        const newVotesData = {
          ...delegatorVotesData,
          voteAllocation: [
            ...delegatorVotesData.voteAllocation,
            { gauge: '', gaugeId: ZERO, votes: '0', added: true, changed: false, gaugeActive: false },
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
            voteAllocation: votesData.voteAllocation.map((vote, i) => {
              if (i == index) {
                return {
                  ...votesData.voteAllocation[i],
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
            voteAllocation: delegatorVotesData.voteAllocation.map((vote, i) => {
              if (i == index) {
                return {
                  ...delegatorVotesData.voteAllocation[i],
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
        usedVotePower: ZERO,
        voteAllocation: [],
      })
      return
    }
    const delegatorVoteInfo = await getVoteInformation(delegatorAddr)
    if (delegatorVoteInfo.delegate.toLowerCase() != account.toLowerCase()) {
      handleDelegatorVotesData({
        votePower: ZERO,
        usedVotePower: ZERO,
        voteAllocation: [],
      })
      return
    }
    const formattedDelegatorVotesData = delegatorVoteInfo.votes.map((item) => {
      const foundGauge = gaugesData.find((g) => g.gaugeId === item.gaugeID)
      const name = foundGauge?.gaugeName ?? ''
      const active = foundGauge?.isActive ?? false
      return {
        gauge: name,
        votes: item.votePowerBPS.mul(delegatorVoteInfo.votePower).div(BigNumber.from('10000')).toString(),
        gaugeId: item.gaugeID,
        added: false,
        changed: false,
        gaugeActive: active,
      }
    })

    handleDelegatorVotesData({
      votePower: delegatorVoteInfo.votePower,
      usedVotePower: delegatorVoteInfo.usedVotePower,
      voteAllocation: formattedDelegatorVotesData,
    })
  }, 300)

  useEffect(() => {
    const getUserVotesData = async () => {
      if (!account) {
        handleVotesData({
          votePower: ZERO,
          usedVotePower: ZERO,
          voteAllocation: [],
        })
        return
      }
      const userVoteInfo = await getVoteInformation(account)
      const formattedUserVotesData = userVoteInfo.votes.map((item) => {
        const foundGauge = gaugesData.find((g) => g.gaugeId === item.gaugeID)
        const name = foundGauge?.gaugeName ?? ''
        const active = foundGauge?.isActive ?? false
        const alloc: VoteAllocation = {
          gauge: name,
          votes: item.votePowerBPS.mul(userVoteInfo.votePower).div(BigNumber.from('10000')).toString(),
          gaugeId: item.gaugeID,
          added: false,
          changed: false,
          gaugeActive: active,
        }
        return alloc
      })
      let newAllocation = votesData.voteAllocation
      if (mounting.current) {
        newAllocation = formattedUserVotesData
        mounting.current = false
      } else {
        for (let i = 0; i < formattedUserVotesData.length; i++) {
          const found = newAllocation.find((item) => item.gaugeId === formattedUserVotesData[i].gaugeId)
          if (found) {
            newAllocation[i] = {
              ...found,
              votes: newAllocation[i].votes,
              gaugeActive: found.gaugeActive,
            }
          }
        }
      }

      const newVotesData = {
        votePower: userVoteInfo.votePower,
        usedVotePower: userVoteInfo.usedVotePower,
        voteAllocation: newAllocation,
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
  }, [])

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
        votesAllocationData={votesData.voteAllocation}
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
