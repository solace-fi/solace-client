import { useState, useEffect, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { usePoolStakedValue, useUserStakedValue } from './useFarm'
import { formatEther, parseEther } from '@ethersproject/units'
import { NUM_BLOCKS_PER_DAY, ZERO } from '../constants'
import { Contract } from '@ethersproject/contracts'
import { floatEther } from '../utils/formatting'
import { useCachedData } from '../context/CachedDataManager'

const useMasterValues = (farmId: number) => {
  const { master } = useContracts()
  const { latestBlock } = useCachedData()
  const [masterValues, setMasterValues] = useState({ allocPoints: ZERO, totalAllocPoints: ZERO, solacePerBlock: ZERO })

  useEffect(() => {
    const getMasterValues = async () => {
      if (!master) return
      try {
        const allocPoints = await master.allocPoints(farmId)
        const totalAllocPoints = await master.totalAllocPoints()
        const solacePerBlock = await master.solacePerBlock()
        setMasterValues({ allocPoints, totalAllocPoints, solacePerBlock })
      } catch (err) {
        console.log('getMasterValues', err)
      }
    }
    getMasterValues()
  }, [farmId, master, latestBlock])
  return masterValues
}

export const useRewardsPerDay = (farmId: number): string => {
  const { allocPoints, totalAllocPoints, solacePerBlock } = useMasterValues(farmId)

  return useMemo(() => {
    const rewards = totalAllocPoints.gt(ZERO)
      ? (floatEther(solacePerBlock) * NUM_BLOCKS_PER_DAY * floatEther(allocPoints)) / floatEther(totalAllocPoints)
      : 0
    const formattedRewards = rewards.toString()
    return formattedRewards
  }, [allocPoints, totalAllocPoints, solacePerBlock])
}

export const useUserRewardsPerDay = (
  farmId: number,
  farm: Contract | null | undefined,
  account: string | undefined
): string => {
  const poolStakedValue = parseEther(usePoolStakedValue(farm))
  const userStakedValue = parseEther(useUserStakedValue(farm, account))
  const { allocPoints, totalAllocPoints, solacePerBlock } = useMasterValues(farmId)

  return useMemo(() => {
    const allocPercentage = totalAllocPoints.gt(ZERO) ? floatEther(allocPoints) / floatEther(totalAllocPoints) : 0
    const poolPercentage = poolStakedValue.gt(ZERO) ? floatEther(userStakedValue) / floatEther(poolStakedValue) : 0
    const rewards = floatEther(solacePerBlock) * allocPercentage * poolPercentage
    const formattedRewards = rewards.toString()
    return formattedRewards
  }, [allocPoints, totalAllocPoints, solacePerBlock, poolStakedValue, userStakedValue])
}

export const useUserPendingRewards = (farm: Contract | null | undefined): string => {
  const { master } = useContracts()
  const { latestBlock } = useCachedData()
  const { account } = useWallet()
  const [userRewards, setUserRewards] = useState<string>('0.00')

  useEffect(() => {
    const getUserPendingRewards = async () => {
      if (!farm || !master || !account) return
      try {
        const farms = await master.numFarms()
        if (farms.isZero()) return
        const pendingReward = await farm.pendingRewards(account)
        const formattedPendingReward = formatEther(pendingReward)
        setUserRewards(formattedPendingReward)
      } catch (err) {
        console.log('getUserPendingRewards', err)
      }
    }
    getUserPendingRewards()
  }, [account, farm, master, latestBlock])

  return userRewards
}

export const useTotalPendingRewards = (): string => {
  const { cpFarm, lpFarm } = useContracts()
  const cpUserRewards = useUserPendingRewards(cpFarm)
  const lpUserRewards = useUserPendingRewards(lpFarm)

  return useMemo(() => {
    const rewards = parseEther(cpUserRewards).add(parseEther(lpUserRewards))
    const formattedRewards = formatEther(rewards)
    return formattedRewards
  }, [cpUserRewards, lpUserRewards])
}
