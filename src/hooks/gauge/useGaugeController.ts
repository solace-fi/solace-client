import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { Vote } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'

export const useGaugeController = () => {
  const { keyContracts } = useContracts()
  const { gaugeController } = useMemo(() => keyContracts, [keyContracts])

  const getEpochStartTimestamp = async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const epochStartTimestamp = await gaugeController.getEpochStartTimestamp()
      return epochStartTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getEpochEndTimestamp = async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const epochEndTimestamp = await gaugeController.getEpochEndTimestamp()
      return epochEndTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getGaugeWeight = async (gaugeId: BigNumber): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const gaugeWeight = await gaugeController.getGaugeWeight(gaugeId)
      return gaugeWeight
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getAllGaugeWeights = async (): Promise<BigNumber[]> => {
    if (!gaugeController) return []
    try {
      const gaugeWeights = await gaugeController.getAllGaugeWeights()
      return gaugeWeights
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const getNumActiveGauges = async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const numActiveGauges = await gaugeController.getNumActiveGauges()
      return numActiveGauges
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getGaugeName = async (gaugeId: BigNumber): Promise<string> => {
    if (!gaugeController) return ''
    try {
      const gaugeName = await gaugeController.getGaugeName(gaugeId)
      return gaugeName
    } catch (error) {
      console.error(error)
      return ''
    }
  }

  const isGaugeActive = async (gaugeId: BigNumber): Promise<boolean> => {
    if (!gaugeController) return false
    try {
      const isActive = await gaugeController.isGaugeActive(gaugeId)
      return isActive
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const getRateOnLineOfGauge = async (gaugeId: BigNumber): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const rateOnLineOfGauge = await gaugeController.getRateOnLineOfGauge(gaugeId)
      return rateOnLineOfGauge
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getInsuranceCapacity = async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const insuranceCapacity = await gaugeController.getInsuranceCapacity()
      return insuranceCapacity
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getVotePowerSum = async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const votePowerSum = await gaugeController.getVotePowerSum()
      return votePowerSum
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getVotes = async (votingContractAddr: string, voter: string): Promise<Vote[]> => {
    if (!gaugeController) return []
    try {
      const votes = await gaugeController.getVotes(votingContractAddr, voter)
      return votes
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const getVoters = async (votingContractAddr: string): Promise<string[]> => {
    if (!gaugeController) return []
    try {
      const voters = await gaugeController.getVoters(votingContractAddr)
      return voters
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const getVoteCount = async (votingContractAddr: string, voter: string): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const voteCount = await gaugeController.getVoteCount(votingContractAddr, voter)
      return voteCount
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getVotersCount = async (votingContractAddr: string): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const votersCount = await gaugeController.getVotersCount(votingContractAddr)
      return votersCount
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  return {
    getEpochStartTimestamp,
    getEpochEndTimestamp,
    getGaugeWeight,
    getAllGaugeWeights,
    getNumActiveGauges,
    getGaugeName,
    isGaugeActive,
    getRateOnLineOfGauge,
    getInsuranceCapacity,
    getVotePowerSum,
    getVotes,
    getVoters,
    getVoteCount,
    getVotersCount,
  }
}
