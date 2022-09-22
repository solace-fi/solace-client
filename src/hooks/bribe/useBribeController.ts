import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useCallback, useMemo } from 'react'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { Bribe, LocalTx, Vote, VoteForGauge } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useGetFunctionGas } from '../provider/useGas'

export const useBribeController = () => {
  const { keyContracts } = useContracts()
  const { bribeController } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const getEpochStartTimestamp = useCallback(async (): Promise<BigNumber> => {
    if (!bribeController) return ZERO
    try {
      const epochStartTimestamp = await bribeController.getEpochStartTimestamp()
      return epochStartTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [bribeController])

  const getEpochEndTimestamp = useCallback(async (): Promise<BigNumber> => {
    if (!bribeController) return ZERO
    try {
      const epochEndTimestamp = await bribeController.getEpochEndTimestamp()
      return epochEndTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [bribeController])

  const getUnusedVotePowerBPS = useCallback(
    async (voter: string): Promise<BigNumber> => {
      if (!bribeController) return ZERO
      try {
        const unusedVotePowerBPS = await bribeController.getUnusedVotePowerBPS(voter)
        return unusedVotePowerBPS
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [bribeController]
  )

  const getAvailableVotePowerBPS = useCallback(
    async (voter: string): Promise<BigNumber> => {
      if (!bribeController) return ZERO
      try {
        const availableVotePowerBPS = await bribeController.getAvailableVotePowerBPS(voter)
        return availableVotePowerBPS
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [bribeController]
  )

  const getBribeTokenWhitelist = useCallback(async (): Promise<string[]> => {
    if (!bribeController) return []
    try {
      const bribeTokenWhitelist = await bribeController.getBribeTokenWhitelist()
      return bribeTokenWhitelist
    } catch (error) {
      console.error(error)
      return []
    }
  }, [bribeController])

  const getClaimableBribes = useCallback(
    async (voter: string): Promise<Bribe[]> => {
      if (!bribeController) return []
      try {
        const claimableBribes = await bribeController.getClaimableBribes(voter)
        return claimableBribes
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const getAllGaugesWithBribe = useCallback(async (): Promise<BigNumber[]> => {
    if (!bribeController) return []
    try {
      const allGaugesWithBribe = await bribeController.getAllGaugesWithBribe()
      return allGaugesWithBribe
    } catch (error) {
      console.error(error)
      return []
    }
  }, [bribeController])

  const getProvidedBribesForGauge = useCallback(
    async (gaugeID: BigNumber): Promise<Bribe[]> => {
      if (!bribeController) return []
      try {
        const providedBribesForGauge = await bribeController.getProvidedBribesForGauge(gaugeID)
        return providedBribesForGauge
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const getLifetimeProvidedBribes = useCallback(
    async (briber: string): Promise<Bribe[]> => {
      if (!bribeController) return []
      try {
        const lifetimeProvidedBribes = await bribeController.getLifetimeProvidedBribes(briber)
        return lifetimeProvidedBribes
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const getVotesForVoter = useCallback(
    async (voter: string): Promise<Vote[]> => {
      if (!bribeController) return []
      try {
        const votesForVoter = await bribeController.getVotesForVoter(voter)
        return votesForVoter
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const getVotesForGauge = useCallback(
    async (gaugeID: BigNumber): Promise<VoteForGauge[]> => {
      if (!bribeController) return []
      try {
        const votesForGauge = await bribeController.getVotesForGauge(gaugeID)
        return votesForGauge
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const isBribingOpen = useCallback(async (): Promise<boolean> => {
    if (!bribeController) return false
    try {
      const isBribingOpen = await bribeController.isBribingOpen()
      return isBribingOpen
    } catch (error) {
      console.error(error)
      return false
    }
  }, [bribeController])

  const provideBribes = useCallback(
    async (bribeTokens: string[], bribeAmounts: BigNumber[], gaugeID: BigNumber) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.provideBribes(bribeTokens, bribeAmounts, gaugeID, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_PROVIDE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const voteForBribe = useCallback(
    async (voter: string, gaugeID: BigNumber, votePowerBPS: BigNumber) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.voteForBribe(voter, gaugeID, votePowerBPS, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_VOTE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const voteForMultipleBribes = useCallback(
    async (voter: string, gaugeIDs: BigNumber[], votePowerBPSs: BigNumber[]) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.voteForMultipleBribes(voter, gaugeIDs, votePowerBPSs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_VOTE_MULTIPLE_BRIBES,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const voteForBribeForMultipleVoters = useCallback(
    async (voters: string[], gaugeIDs: BigNumber[], votePowerBPSs: BigNumber[]) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.voteForBribeForMultipleVoters(voters, gaugeIDs, votePowerBPSs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_VOTE_MULTIPLE_VOTERS,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const removeVoteForBribe = useCallback(
    async (voter: string, gaugeID: BigNumber) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.removeVoteForBribe(voter, gaugeID, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_REMOVE_VOTE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const removeVoteForMultipleBribes = useCallback(
    async (voter: string, gaugeIDs: BigNumber[]) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.removeVoteForMultipleBribes(voter, gaugeIDs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_REMOVE_VOTES_MULTIPLE_BRIBES,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const removeVoteForBribeForMultipleVoters = useCallback(
    async (voters: string[], gaugeIDs: BigNumber[]) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.removeVoteForBribeForMultipleVoters(voters, gaugeIDs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_REMOVE_VOTES_MULTIPLE_VOTERS,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const claimBribes = useCallback(async () => {
    if (!bribeController) return { tx: null, localTx: null }
    const tx = await bribeController.claimBribes({ ...gasConfig, gasLimit: 800000 })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.BRIBE_CLAIM,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }, [bribeController, gasConfig])

  return {
    getEpochStartTimestamp,
    getEpochEndTimestamp,
    getUnusedVotePowerBPS,
    getAvailableVotePowerBPS,
    getBribeTokenWhitelist,
    getClaimableBribes,
    getAllGaugesWithBribe,
    getProvidedBribesForGauge,
    getLifetimeProvidedBribes,
    getVotesForVoter,
    getVotesForGauge,
    isBribingOpen,
    provideBribes,
    voteForBribe,
    voteForMultipleBribes,
    voteForBribeForMultipleVoters,
    removeVoteForBribe,
    removeVoteForMultipleBribes,
    removeVoteForBribeForMultipleVoters,
    claimBribes,
  }
}
