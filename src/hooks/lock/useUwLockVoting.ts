import { ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useCallback, useMemo } from 'react'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, Vote } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { isAddress } from '../../utils'
import { useGetFunctionGas } from '../provider/useGas'

export const useUwLockVoting = () => {
  const { keyContracts } = useContracts()
  const { uwLockVoting } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const getVotePower = useCallback(
    async (voter: string): Promise<BigNumber> => {
      if (!uwLockVoting) return ZERO
      try {
        const votePower = await uwLockVoting.getVotePower(voter)
        return votePower
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwLockVoting]
  )

  const getVotes = useCallback(
    async (voter: string): Promise<Vote[]> => {
      if (!uwLockVoting) return []
      try {
        const votes = await uwLockVoting.getVotes(voter)
        return votes
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [uwLockVoting]
  )

  const getEpochStartTimestamp = useCallback(async (): Promise<BigNumber> => {
    if (!uwLockVoting) return ZERO
    try {
      const epochStartTimestamp = await uwLockVoting.getEpochStartTimestamp()
      return epochStartTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [uwLockVoting])

  const getEpochEndTimestamp = useCallback(async (): Promise<BigNumber> => {
    if (!uwLockVoting) return ZERO
    try {
      const epochEndTimestamp = await uwLockVoting.getEpochEndTimestamp()
      return epochEndTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [uwLockVoting])

  const isVotingOpen = useCallback(async (): Promise<boolean> => {
    if (!uwLockVoting) return false
    try {
      const isVotingOpen = await uwLockVoting.isVotingOpen()
      return isVotingOpen
    } catch (error) {
      console.error(error)
      return false
    }
  }, [uwLockVoting])

  const delegateOf = useCallback(
    async (voter: string): Promise<string> => {
      if (!uwLockVoting) return ZERO_ADDRESS
      try {
        const delegate = await uwLockVoting.delegateOf(voter)
        return delegate
      } catch (error) {
        console.error(error)
        return ZERO_ADDRESS
      }
    },
    [uwLockVoting]
  )

  const getVotingDelegatorsOf = useCallback(
    async (delegate: string): Promise<string[]> => {
      if (!uwLockVoting) return []
      try {
        const delegators = await uwLockVoting.getVotingDelegatorsOf(delegate)
        return delegators
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [uwLockVoting]
  )

  const usedVotePowerBPSOf = useCallback(
    async (voter: string): Promise<BigNumber> => {
      if (!uwLockVoting) return ZERO
      try {
        const usedVotePowerBPS = await uwLockVoting.usedVotePowerBPSOf(voter)
        return usedVotePowerBPS
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwLockVoting]
  )

  const vote = useCallback(
    async (voter: string, gaugeId: BigNumber, votePowerBPS: BigNumber) => {
      if (!uwLockVoting) return { tx: null, localTx: null }
      const tx = await uwLockVoting.vote(voter, gaugeId, votePowerBPS, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.VOTE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLockVoting]
  )

  const voteMultiple = useCallback(
    async (voter: string, gaugeIds: BigNumber[], votePowerBPSs: BigNumber[]) => {
      if (!uwLockVoting) return { tx: null, localTx: null }
      const tx = await uwLockVoting.voteMultiple(voter, gaugeIds, votePowerBPSs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.VOTE_MULTIPLE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLockVoting]
  )

  const removeVote = useCallback(
    async (voter: string, gaugeId: BigNumber) => {
      if (!uwLockVoting) return { tx: null, localTx: null }
      const tx = await uwLockVoting.removeVote(voter, gaugeId, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.REMOVE_VOTE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLockVoting]
  )

  const removeVoteMultiple = useCallback(
    async (voter: string, gaugeIds: BigNumber[]) => {
      if (!uwLockVoting) return { tx: null, localTx: null }
      const tx = await uwLockVoting.removeVoteMultiple(voter, gaugeIds, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.REMOVE_VOTE_MULTIPLE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLockVoting]
  )

  const setDelegate = useCallback(
    async (delegate: string) => {
      if (!uwLockVoting) return { tx: null, localTx: null }
      const tx = await uwLockVoting.setDelegate(delegate, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.SET_DELEGATE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLockVoting]
  )

  return {
    getVotePower,
    getVotes,
    getEpochStartTimestamp,
    getEpochEndTimestamp,
    isVotingOpen,
    vote,
    voteMultiple,
    removeVote,
    removeVoteMultiple,
    setDelegate,
    delegateOf,
    usedVotePowerBPSOf,
    getVotingDelegatorsOf,
  }
}

export const useUwLockVotingHelper = () => {
  const { getVotePower, usedVotePowerBPSOf, getVotes, delegateOf } = useUwLockVoting()

  const getVoteInformation = useCallback(
    async (voter: string) => {
      if (!isAddress(voter))
        return {
          votePower: ZERO,
          usedVotePowerBPS: ZERO,
          delegate: ZERO_ADDRESS,
          votes: [],
        }
      const [votePower, usedVotePowerBPS, votes, delegate] = await Promise.all([
        getVotePower(voter),
        usedVotePowerBPSOf(voter),
        getVotes(voter),
        delegateOf(voter),
      ])
      return { votePower, usedVotePowerBPS, votes, delegate }
    },
    [delegateOf, getVotePower, getVotes, usedVotePowerBPSOf]
  )

  return { getVoteInformation }
}
