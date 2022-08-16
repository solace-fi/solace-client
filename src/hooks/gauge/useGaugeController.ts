import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Vote } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'

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

export const useGaugeControllerHelper = () => {
  const { getAllGaugeWeights, getGaugeName, isGaugeActive } = useGaugeController()
  const { activeNetwork } = useNetwork()
  const { latestBlock } = useProvider()
  const [loading, setLoading] = useState(false)
  const running = useRef(false)
  const [gaugesData, setGaugesData] = useState<
    {
      gaugeId: BigNumber
      gaugeName: string
      gaugeWeight: BigNumber
      isActive: boolean
    }[]
  >([])

  const fetchGauges = useCallback(async () => {
    setLoading(true)
    const offset = 1
    const gaugeWeights = await getAllGaugeWeights()
    const adjustedGaugeWeights = gaugeWeights.slice(offset)

    const gaugeNames = await Promise.all(
      adjustedGaugeWeights.map(async (gaugeWeight, i) => {
        return await getGaugeName(BigNumber.from(i).add(BigNumber.from(offset)))
      })
    )

    const gaugesActive = await Promise.all(
      adjustedGaugeWeights.map(async (gaugeWeight, i) => {
        return await isGaugeActive(BigNumber.from(i).add(BigNumber.from(offset)))
      })
    )

    const _gaugesData = adjustedGaugeWeights.map((gaugeWeight, i) => {
      return {
        gaugeId: BigNumber.from(i).add(BigNumber.from(offset)),
        gaugeName: gaugeNames[i],
        gaugeWeight,
        isActive: gaugesActive[i],
      }
    })

    setGaugesData(_gaugesData)
    setLoading(false)
  }, [])

  useEffect(() => {
    const callFetchGauges = async () => {
      if (running.current) return
      running.current = true
      await fetchGauges()
      running.current = false
    }
    callFetchGauges()
  }, [activeNetwork, latestBlock, fetchGauges])

  return { loading, gaugesData }
}
