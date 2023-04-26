import { ZERO } from '@solace-fi/sdk-nightly'
import { Contract as MulticallContract } from 'ethers-multicall'
import { BigNumber, Contract } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GaugeData, Vote } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useUwp } from '../lock/useUnderwritingHelper'

import gaugeControllerABI from '../../constants/abi/GaugeController.json'
import underwritingLockVotingABI from '../../constants/abi/UnderwritingLockVoting.json'
import { MAX_BPS } from '../../constants'
import { networks, useNetwork } from '../../context/NetworkManager'
import { multicallChunked, MulticallProvider } from '../../utils/contract'
import { fetchExplorerTxHistoryByAddress } from '../../utils/explorer'
import { decodeInput } from '../../utils/decoder'
import { useContractArray } from '../contract/useContract'
import { JsonRpcProvider } from '@ethersproject/providers'

export const useGaugeController = () => {
  const { activeNetwork } = useNetwork()
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

  const getAllGaugeWeights = useCallback(
    async (chainId?: number): Promise<BigNumber[]> => {
      let c = gaugeController
      if (chainId && activeNetwork.chainId != chainId) {
        const desiredNetwork = networks.find((n) => n.chainId == chainId) ?? networks[0]
        const localProvider = new JsonRpcProvider(desiredNetwork.rpc.httpsUrl)
        const gaugeControllerCs = desiredNetwork.config.keyContracts.gaugeController
        c = new Contract(gaugeControllerCs.addr, gaugeControllerABI, localProvider)
      }
      if (!c) return []
      try {
        const gaugeWeights = await c.getAllGaugeWeights()
        return gaugeWeights
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [gaugeController, activeNetwork.chainId]
  )

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
    async (gaugeId: BigNumber, chainId?: number): Promise<string> => {
      let c = gaugeController
      if (chainId && activeNetwork.chainId != chainId) {
        const desiredNetwork = networks.find((n) => n.chainId == chainId) ?? networks[0]
        const localProvider = new JsonRpcProvider(desiredNetwork.rpc.httpsUrl)
        const gaugeControllerCs = desiredNetwork.config.keyContracts.gaugeController
        c = new Contract(gaugeControllerCs.addr, gaugeControllerABI, localProvider)
      }
      if (!c) return ''
      try {
        const gaugeName = await c.getGaugeName(gaugeId)
        return gaugeName
      } catch (error) {
        console.error(error)
        return ''
      }
    },
    [gaugeController, activeNetwork.chainId]
  )

  const isGaugeActive = useCallback(
    async (gaugeId: BigNumber, chainId?: number): Promise<boolean> => {
      let c = gaugeController
      if (chainId && activeNetwork.chainId != chainId) {
        const desiredNetwork = networks.find((n) => n.chainId == chainId) ?? networks[0]
        const localProvider = new JsonRpcProvider(desiredNetwork.rpc.httpsUrl)
        const gaugeControllerCs = desiredNetwork.config.keyContracts.gaugeController
        c = new Contract(gaugeControllerCs.addr, gaugeControllerABI, localProvider)
      }
      if (!c) return false
      try {
        const isActive = await c.isGaugeActive(gaugeId)
        return isActive
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [gaugeController, activeNetwork.chainId]
  )

  const getRateOnLineOfGauge = useCallback(
    async (gaugeId: BigNumber, chainId?: number): Promise<BigNumber> => {
      let c = gaugeController
      if (chainId && activeNetwork.chainId != chainId) {
        const desiredNetwork = networks.find((n) => n.chainId == chainId) ?? networks[0]
        const localProvider = new JsonRpcProvider(desiredNetwork.rpc.httpsUrl)
        const gaugeControllerCs = desiredNetwork.config.keyContracts.gaugeController
        c = new Contract(gaugeControllerCs.addr, gaugeControllerABI, localProvider)
      }
      if (!c) return ZERO
      try {
        const rateOnLineOfGauge = await c.getRateOnLineOfGauge(gaugeId)
        return rateOnLineOfGauge
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [gaugeController, activeNetwork.chainId]
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
    async (votingContractAddr: string, chainId?: number): Promise<string[]> => {
      let c = gaugeController
      if (chainId && activeNetwork.chainId != chainId) {
        const desiredNetwork = networks.find((n) => n.chainId == chainId) ?? networks[0]
        const localProvider = new JsonRpcProvider(desiredNetwork.rpc.httpsUrl)
        const gaugeControllerCs = desiredNetwork.config.keyContracts.gaugeController
        c = new Contract(gaugeControllerCs.addr, gaugeControllerABI, localProvider)
      }
      if (!c) return []
      try {
        const voters = await c.getVoters(votingContractAddr)
        return voters
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [gaugeController, activeNetwork.chainId]
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

export const useGaugeControllerHelper = (chainId: number, disabled?: boolean) => {
  const { getAllGaugeWeights, getGaugeName, isGaugeActive, getVoters } = useGaugeController()
  const { valueOfHolder } = useUwp()

  const desiredNetwork = useMemo(() => networks.find((n) => n.chainId == chainId) ?? networks[0], [chainId])
  const localProvider = useMemo(() => new JsonRpcProvider(desiredNetwork.rpc.httpsUrl), [desiredNetwork.rpc.httpsUrl])

  const gaugeControllerCs = useMemo(() => desiredNetwork.config.keyContracts.gaugeController, [desiredNetwork])
  const uwLockVotingCs = useMemo(() => desiredNetwork.config.keyContracts.uwLockVoting, [desiredNetwork])
  const uweCs = useMemo(() => desiredNetwork.config.keyContracts.uwe, [desiredNetwork])

  const contractSources = useContractArray(desiredNetwork)

  const [loading, setLoading] = useState(false)
  const running = useRef(false)

  const [currentGaugesData, setCurrentGaugesData] = useState<GaugeData[]>([])
  const [nextGaugesData, setNextGaugesData] = useState<GaugeData[]>([])
  const [insuranceCapacity, setInsuranceCapacity] = useState<number>(0)
  const [leverageFactor, setLeverageFactor] = useState<number>(0)

  const fetchGauges = useCallback(async () => {
    if (!gaugeControllerCs || !uwLockVotingCs) return
    setLoading(true)
    const data = await fetchExplorerTxHistoryByAddress(desiredNetwork, gaugeControllerCs.addr)
    const gaugeNameToStartTimestampMapping: { [key: string]: string } = {}
    for (let i = 0; i < data.result.length; i++) {
      const decodedInput = decodeInput(data.result[i], contractSources)
      if (decodedInput?.name == 'addGauge') {
        const gaugeName = decodedInput.args[0]
        const timeStamp = data.result[i].timeStamp
        gaugeNameToStartTimestampMapping[gaugeName] = timeStamp
      }
    }
    const offset = 1
    const gaugeWeights = await getAllGaugeWeights(chainId)
    const adjustedGaugeWeights = gaugeWeights.slice(offset)

    try {
      const gaugeNames = await Promise.all(
        adjustedGaugeWeights.map(async (gaugeWeight, i) => {
          return await getGaugeName(BigNumber.from(i).add(BigNumber.from(offset)), chainId)
        })
      )

      const gaugesActive = await Promise.all(
        adjustedGaugeWeights.map(async (gaugeWeight, i) => {
          return await isGaugeActive(BigNumber.from(i).add(BigNumber.from(offset)), chainId)
        })
      )

      const _currentGaugesData: GaugeData[] = adjustedGaugeWeights.map((gaugeWeight, i) => {
        return {
          gaugeId: BigNumber.from(i).add(BigNumber.from(offset)),
          gaugeName: gaugeNames[i],
          gaugeWeight,
          isActive: gaugesActive[i],
          startTimestamp: gaugeNameToStartTimestampMapping[gaugeNames[i]],
        }
      })

      const mcProvider = new MulticallProvider(localProvider, chainId)
      const gaugeControllerMC = new MulticallContract(gaugeControllerCs.addr, gaugeControllerABI)
      const nextEpochWeights: BigNumber[] = Array(adjustedGaugeWeights.length).fill(ZERO)
      const VOTING_CONTRACTS = [uwLockVotingCs.addr]
      const VOTING_ABIS = [underwritingLockVotingABI]

      for (let i = 0; i < VOTING_CONTRACTS.length; ++i) {
        const voters: string[] = await getVoters(VOTING_CONTRACTS[i], chainId)
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

      const _nextGaugesData: GaugeData[] = nextEpochWeights.map((gaugeWeight, i) => {
        return {
          gaugeId: BigNumber.from(i).add(BigNumber.from(offset)),
          gaugeName: gaugeNames[i],
          gaugeWeight,
          isActive: gaugesActive[i],
          startTimestamp: gaugeNameToStartTimestampMapping[gaugeNames[i]],
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
    gaugeControllerCs,
    uwLockVotingCs,
    contractSources,
    desiredNetwork,
    localProvider,
    chainId,
  ])

  useEffect(() => {
    const callFetchGauges = async () => {
      if (running.current || !gaugeControllerCs || disabled || !desiredNetwork.config.generalFeatures.native) return
      running.current = true
      await fetchGauges()
      running.current = false
    }
    callFetchGauges()
  }, [fetchGauges, gaugeControllerCs, disabled])

  useEffect(() => {
    if (!uweCs || !gaugeControllerCs || disabled || !desiredNetwork.config.generalFeatures.native) return
    const calculateInsuranceCapacity = async () => {
      const uf = await valueOfHolder(uweCs.addr, desiredNetwork.chainId)
      const gaugeControllerContract = new Contract(gaugeControllerCs.addr, gaugeControllerABI, localProvider)
      const l = await gaugeControllerContract.leverageFactor()
      const convertedUf = formatUnits(uf, 18)
      const convertedL = formatUnits(l, 18)
      const sic = parseFloat(convertedUf) * parseFloat(convertedL)
      setLeverageFactor(parseFloat(convertedL))
      setInsuranceCapacity(sic)
    }
    calculateInsuranceCapacity()
  }, [uweCs, gaugeControllerCs, valueOfHolder, localProvider, disabled, desiredNetwork])

  return { loading, currentGaugesData, nextGaugesData, insuranceCapacity, leverageFactor }
}
