import { ZERO } from '@solace-fi/sdk-nightly'
import { Contract as MulticallContract } from 'ethers-multicall'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GaugeData, Vote } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useUwp } from '../lock/useUnderwritingHelper'
import { useProvider } from '../../context/ProviderManager'

import gaugeControllerABI from '../../constants/abi/GaugeController.json'
import underwritingLockVotingABI from '../../constants/abi/UnderwritingLockVoting.json'
import { MAX_BPS } from '../../constants'
import { useNetwork } from '../../context/NetworkManager'
import { multicallChunked, MulticallProvider } from '../../utils/contract'

export const useGaugeController = () => {
  const { keyContracts } = useContracts()
  const { gaugeController } = useMemo(() => keyContracts, [keyContracts])

  const getEpochStartTimestamp = useCallback(async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const epochStartTimestamp = await gaugeController.getEpochStartTimestamp()
      return epochStartTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [gaugeController])

  const getEpochEndTimestamp = useCallback(async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const epochEndTimestamp = await gaugeController.getEpochEndTimestamp()
      return epochEndTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [gaugeController])

  const getGaugeWeight = useCallback(
    async (gaugeId: BigNumber): Promise<BigNumber> => {
      if (!gaugeController) return ZERO
      try {
        const gaugeWeight = await gaugeController.getGaugeWeight(gaugeId)
        return gaugeWeight
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [gaugeController]
  )

  const getAllGaugeWeights = useCallback(async (): Promise<BigNumber[]> => {
    if (!gaugeController) return []
    try {
      const gaugeWeights = await gaugeController.getAllGaugeWeights()
      return gaugeWeights
    } catch (error) {
      console.error(error)
      return []
    }
  }, [gaugeController])

  const getNumActiveGauges = useCallback(async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const numActiveGauges = await gaugeController.getNumActiveGauges()
      return numActiveGauges
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [gaugeController])

  const getGaugeName = useCallback(
    async (gaugeId: BigNumber): Promise<string> => {
      if (!gaugeController) return ''
      try {
        const gaugeName = await gaugeController.getGaugeName(gaugeId)
        return gaugeName
      } catch (error) {
        console.error(error)
        return ''
      }
    },
    [gaugeController]
  )

  const isGaugeActive = useCallback(
    async (gaugeId: BigNumber): Promise<boolean> => {
      if (!gaugeController) return false
      try {
        const isActive = await gaugeController.isGaugeActive(gaugeId)
        return isActive
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [gaugeController]
  )

  const getRateOnLineOfGauge = useCallback(
    async (gaugeId: BigNumber): Promise<BigNumber> => {
      if (!gaugeController) return ZERO
      try {
        const rateOnLineOfGauge = await gaugeController.getRateOnLineOfGauge(gaugeId)
        return rateOnLineOfGauge
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [gaugeController]
  )

  const getInsuranceCapacity = useCallback(async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const insuranceCapacity = await gaugeController.getInsuranceCapacity()
      return insuranceCapacity
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [gaugeController])

  const getVotePowerSum = useCallback(async (): Promise<BigNumber> => {
    if (!gaugeController) return ZERO
    try {
      const votePowerSum = await gaugeController.getVotePowerSum()
      return votePowerSum
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [gaugeController])

  const getVotes = useCallback(
    async (votingContractAddr: string, voter: string): Promise<Vote[]> => {
      if (!gaugeController) return []
      try {
        const votes = await gaugeController.getVotes(votingContractAddr, voter)
        return votes
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [gaugeController]
  )

  const getVoters = useCallback(
    async (votingContractAddr: string): Promise<string[]> => {
      if (!gaugeController) return []
      try {
        const voters = await gaugeController.getVoters(votingContractAddr)
        return voters
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [gaugeController]
  )

  const getVoteCount = useCallback(
    async (votingContractAddr: string, voter: string): Promise<BigNumber> => {
      if (!gaugeController) return ZERO
      try {
        const voteCount = await gaugeController.getVoteCount(votingContractAddr, voter)
        return voteCount
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [gaugeController]
  )

  const getVotersCount = useCallback(
    async (votingContractAddr: string): Promise<BigNumber> => {
      if (!gaugeController) return ZERO
      try {
        const votersCount = await gaugeController.getVotersCount(votingContractAddr)
        return votersCount
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [gaugeController]
  )

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
  const { getAllGaugeWeights, getGaugeName, isGaugeActive, getVoters } = useGaugeController()
  const { valueOfHolder } = useUwp()
  const { activeNetwork } = useNetwork()
  const { provider } = useProvider()
  const { keyContracts } = useContracts()
  const { uwe, gaugeController, uwLockVoting } = keyContracts

  const [loading, setLoading] = useState(false)
  const running = useRef(false)

  const [currentGaugesData, setCurrentGaugesData] = useState<GaugeData[]>([])
  const [nextGaugesData, setNextGaugesData] = useState<GaugeData[]>([])
  const [insuranceCapacity, setInsuranceCapacity] = useState<number>(0)
  const [leverageFactor, setLeverageFactor] = useState<number>(0)

  const fetchGauges = useCallback(async () => {
    if (!gaugeController || !uwLockVoting) return
    setLoading(true)
    const offset = 1
    const gaugeWeights = await getAllGaugeWeights()
    const adjustedGaugeWeights = gaugeWeights.slice(offset)

    try {
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

      const _currentGaugesData = adjustedGaugeWeights.map((gaugeWeight, i) => {
        return {
          gaugeId: BigNumber.from(i).add(BigNumber.from(offset)),
          gaugeName: gaugeNames[i],
          gaugeWeight,
          isActive: gaugesActive[i],
        }
      })

      const mcProvider = new MulticallProvider(provider, activeNetwork.chainId)
      const gaugeControllerMC = new MulticallContract(gaugeController.address, gaugeControllerABI)
      const nextEpochWeights: BigNumber[] = Array(adjustedGaugeWeights.length).fill(ZERO)
      const VOTING_CONTRACTS = [uwLockVoting.address]
      const VOTING_ABIS = [underwritingLockVotingABI]

      for (let i = 0; i < VOTING_CONTRACTS.length; ++i) {
        const voters: string[] = await getVoters(VOTING_CONTRACTS[i])
        const voteContractMC = new MulticallContract(VOTING_CONTRACTS[i], VOTING_ABIS[i])
        const [votePowers, votes] = await Promise.all([
          multicallChunked(
            mcProvider,
            voters.map((voter) => voteContractMC.getVotePower(voter))
          ),
          multicallChunked(
            mcProvider,
            voters.map((voter) => gaugeControllerMC.getVotes(VOTING_CONTRACTS[i], voter))
          ),
        ])
        for (let j = 0; j < voters.length; ++j) {
          const votePower: BigNumber = votePowers[j]
          for (let k = 0; k < votes[j].length; ++k) {
            const gaugeID: number = votes[j][k].gaugeID.toNumber()
            const votePowerBPS = votes[j][k].votePowerBPS
            nextEpochWeights[gaugeID - offset] = nextEpochWeights[gaugeID - offset].add(
              votePower.mul(votePowerBPS).div(MAX_BPS)
            )
          }
        }
      }

      const sumNextEpochWeights = nextEpochWeights.reduce((a, b) => a.add(b), ZERO)
      if (sumNextEpochWeights.gt(ZERO)) {
        nextEpochWeights.forEach((weight, i) => {
          nextEpochWeights[i] = weight.mul(BigNumber.from(10).pow(18)).div(sumNextEpochWeights)
        })
      }

      const _nextGaugesData = nextEpochWeights.map((gaugeWeight, i) => {
        return {
          gaugeId: BigNumber.from(i).add(BigNumber.from(offset)),
          gaugeName: gaugeNames[i],
          gaugeWeight,
          isActive: gaugesActive[i],
        }
      })

      setCurrentGaugesData(_currentGaugesData)
      setNextGaugesData(_nextGaugesData)
    } catch (error) {
      console.error('fetchGauges', error)
    }
    setLoading(false)
  }, [
    getAllGaugeWeights,
    getGaugeName,
    isGaugeActive,
    getVoters,
    gaugeController,
    uwLockVoting,
    activeNetwork.chainId,
    provider,
  ])

  useEffect(() => {
    const callFetchGauges = async () => {
      if (running.current || !gaugeController) return
      running.current = true
      await fetchGauges()
      running.current = false
    }
    callFetchGauges()
  }, [fetchGauges, gaugeController])

  useEffect(() => {
    if (!uwe || !gaugeController) return
    const calculateInsuranceCapacity = async () => {
      const uf = await valueOfHolder(uwe.address)
      const l = await gaugeController.leverageFactor()
      const convertedUf = formatUnits(uf, 18)
      const convertedL = formatUnits(l, 18)
      const sic = parseFloat(convertedUf) * parseFloat(convertedL)
      setLeverageFactor(parseFloat(convertedL))
      setInsuranceCapacity(sic)
    }
    calculateInsuranceCapacity()
  }, [uwe, gaugeController, valueOfHolder])

  return { loading, currentGaugesData, nextGaugesData, insuranceCapacity, leverageFactor }
}
