import { useState, useEffect, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { usePoolStakedValue, useUserStakedValue } from './useFarm'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { NUM_SECONDS_PER_DAY, ZERO } from '../constants'
import { Contract } from '@ethersproject/contracts'
import { floatUnits } from '../utils/formatting'
import { useNetwork } from '../context/NetworkManager'
import { useProvider } from '../context/ProviderManager'

const useFarmControllerValues = (farmId: number) => {
  const { keyContracts } = useContracts()
  const { farmController } = useMemo(() => keyContracts, [keyContracts])
  const { latestBlock } = useProvider()
  const [farmControllerValues, setFarmControllerValues] = useState({
    allocPoints: ZERO,
    totalAllocPoints: ZERO,
    rewardPerSecond: ZERO,
  })

  useEffect(() => {
    const getFarmControllerValues = async () => {
      if (!farmController) return
      try {
        const allocPoints = await farmController.allocPoints(farmId)
        const totalAllocPoints = await farmController.totalAllocPoints()
        const rewardPerSecond = await farmController.rewardPerSecond()
        setFarmControllerValues({ allocPoints, totalAllocPoints, rewardPerSecond })
      } catch (err) {
        console.log('getFarmControllerValues', err)
      }
    }
    getFarmControllerValues()
  }, [farmId, farmController, latestBlock])
  return farmControllerValues
}

export const useRewardsPerDay = (farmId: number): string => {
  const { allocPoints, totalAllocPoints, rewardPerSecond } = useFarmControllerValues(farmId)
  const { currencyDecimals } = useNetwork()

  return useMemo(() => {
    const rewards = totalAllocPoints.gt(ZERO)
      ? (floatUnits(rewardPerSecond, currencyDecimals) *
          NUM_SECONDS_PER_DAY *
          floatUnits(allocPoints, currencyDecimals)) /
        floatUnits(totalAllocPoints, currencyDecimals)
      : 0
    const formattedRewards = rewards.toString()
    return formattedRewards
  }, [allocPoints, totalAllocPoints, rewardPerSecond, currencyDecimals])
}

export const useUserRewardsPerDay = (farmId: number, farm: Contract | null | undefined): string => {
  const { currencyDecimals } = useNetwork()
  const poolStakedValue = parseUnits(usePoolStakedValue(farm), currencyDecimals)
  const userStakedValue = parseUnits(useUserStakedValue(farm), currencyDecimals)
  const { allocPoints, totalAllocPoints, rewardPerSecond } = useFarmControllerValues(farmId)

  return useMemo(() => {
    const allocPercentage = totalAllocPoints.gt(ZERO)
      ? floatUnits(allocPoints, currencyDecimals) / floatUnits(totalAllocPoints, currencyDecimals)
      : 0
    const poolPercentage = poolStakedValue.gt(ZERO)
      ? floatUnits(userStakedValue, currencyDecimals) / floatUnits(poolStakedValue, currencyDecimals)
      : 0
    const rewards =
      floatUnits(rewardPerSecond, currencyDecimals) * NUM_SECONDS_PER_DAY * allocPercentage * poolPercentage
    const formattedRewards = rewards.toString()
    return formattedRewards
  }, [allocPoints, totalAllocPoints, rewardPerSecond, poolStakedValue, userStakedValue, currencyDecimals])
}

export const useUserPendingRewards = (farm: Contract | null | undefined): string => {
  const { keyContracts } = useContracts()
  const { farmController } = useMemo(() => keyContracts, [keyContracts])
  const { latestBlock } = useProvider()
  const { account } = useWallet()
  const { currencyDecimals } = useNetwork()
  const [userRewards, setUserRewards] = useState<string>('0')

  useEffect(() => {
    const getUserPendingRewards = async () => {
      if (!farm || !farmController || !account) return
      try {
        const farms = await farmController.numFarms()
        if (farms.isZero()) return
        const pendingReward = await farm.pendingRewards(account)
        const formattedPendingReward = formatUnits(pendingReward, currencyDecimals)
        setUserRewards(formattedPendingReward)
      } catch (err) {
        console.log('getUserPendingRewards', err)
      }
    }
    getUserPendingRewards()
  }, [account, farm, farmController, latestBlock, currencyDecimals])

  return userRewards
}

export const useTotalPendingRewards = (): string => {
  const { keyContracts } = useContracts()
  const { farmController } = useMemo(() => keyContracts, [keyContracts])
  const { currencyDecimals } = useNetwork()
  const { account } = useWallet()
  const [totalPendingRewards, setTotalPendingRewards] = useState<string>('0')

  useEffect(() => {
    const getTotalPendingRewards = async () => {
      if (!farmController || !account) return
      const rewards = await farmController.pendingRewards(account)
      const formattedRewards = formatUnits(rewards, currencyDecimals)
      setTotalPendingRewards(formattedRewards)
    }
    getTotalPendingRewards()
  }, [farmController, currencyDecimals, account])

  return totalPendingRewards
}
