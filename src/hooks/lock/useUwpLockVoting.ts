import { ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useCallback, useMemo } from 'react'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, Vote } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useGetFunctionGas } from '../provider/useGas'

export const useUwpLockVoting = () => {
  const { keyContracts } = useContracts()
  const { uwpLockVoting } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const getVotePower = async (voter: string): Promise<BigNumber> => {
    if (!uwpLockVoting) return ZERO
    try {
      const votePower = await uwpLockVoting.getVotePower(voter)
      return votePower
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getVotes = async (voter: string): Promise<Vote[]> => {
    if (!uwpLockVoting) return []
    try {
      const votes = await uwpLockVoting.getVotes(voter)
      return votes
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const getEpochStartTimestamp = async (): Promise<BigNumber> => {
    if (!uwpLockVoting) return ZERO
    try {
      const epochStartTimestamp = await uwpLockVoting.getEpochStartTimestamp()
      return epochStartTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getEpochEndTimestamp = async (): Promise<BigNumber> => {
    if (!uwpLockVoting) return ZERO
    try {
      const epochEndTimestamp = await uwpLockVoting.getEpochEndTimestamp()
      return epochEndTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const isVotingOpen = async (): Promise<boolean> => {
    if (!uwpLockVoting) return false
    try {
      const isVotingOpen = await uwpLockVoting.isVotingOpen()
      return isVotingOpen
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const vote = async (voter: string, gaugeId: BigNumber, votePowerBPS: BigNumber) => {
    if (!uwpLockVoting) return { tx: null, localTx: null }
    const tx = await uwpLockVoting.vote(voter, gaugeId, votePowerBPS, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.VOTE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const voteMultiple = async (voter: string, gaugeIds: BigNumber[], votePowerBPSs: BigNumber[]) => {
    if (!uwpLockVoting) return { tx: null, localTx: null }
    const tx = await uwpLockVoting.voteMultiple(voter, gaugeIds, votePowerBPSs, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.VOTE_MULTIPLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const removeVote = async (voter: string, gaugeId: BigNumber) => {
    if (!uwpLockVoting) return { tx: null, localTx: null }
    const tx = await uwpLockVoting.removeVote(voter, gaugeId, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.REMOVE_VOTE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const removeVoteMultiple = async (voter: string, gaugeIds: BigNumber[]) => {
    if (!uwpLockVoting) return { tx: null, localTx: null }
    const tx = await uwpLockVoting.removeVoteMultiple(voter, gaugeIds, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.REMOVE_VOTE_MULTIPLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const setDelegate = async (delegate: string) => {
    if (!uwpLockVoting) return { tx: null, localTx: null }
    const tx = await uwpLockVoting.setDelegate(delegate, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SET_DELEGATE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const delegateOf = async (voter: string): Promise<string> => {
    if (!uwpLockVoting) return ZERO_ADDRESS
    try {
      const delegate = await uwpLockVoting.delegateOf(voter)
      return delegate
    } catch (error) {
      console.error(error)
      return ZERO_ADDRESS
    }
  }

  const usedVotePowerBPSOf = async (voter: string): Promise<BigNumber> => {
    if (!uwpLockVoting) return ZERO
    try {
      const usedVotePowerBPS = await uwpLockVoting.usedVotePowerBPSOf(voter)
      return usedVotePowerBPS
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

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
  }
}

export const useUwpLockVotingHelper = () => {
  const { getVotePower, usedVotePowerBPSOf, getVotes, delegateOf } = useUwpLockVoting()

  const getVoteInformation = useCallback(async (voter: string) => {
    const [votePower, usedVotePowerBPS, votes, delegate] = await Promise.all([
      getVotePower(voter),
      usedVotePowerBPSOf(voter),
      getVotes(voter),
      delegateOf(voter),
    ])
    const usedVotePower = votePower.mul(usedVotePowerBPS).div(BigNumber.from('10000'))
    return { votePower, usedVotePower, votes, delegate }
  }, [])

  return { getVoteInformation }
}
