import { useState, useEffect, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { usePoolStakedValue, useUserStakedValue } from './useFarm'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { NUM_BLOCKS_PER_DAY, ZERO } from '../constants'
import { Contract } from '@ethersproject/contracts'
import { floatUnits } from '../utils/formatting'
import { useCachedData } from '../context/CachedDataManager'
import { useNetwork } from '../context/NetworkManager'

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
  const { currencyDecimals } = useNetwork()

  return useMemo(() => {
    const rewards = totalAllocPoints.gt(ZERO)
      ? (floatUnits(solacePerBlock, currencyDecimals) *
          NUM_BLOCKS_PER_DAY *
          floatUnits(allocPoints, currencyDecimals)) /
        floatUnits(totalAllocPoints, currencyDecimals)
      : 0
    const formattedRewards = rewards.toString()
    return formattedRewards
  }, [allocPoints, totalAllocPoints, solacePerBlock, currencyDecimals])
}

export const useUserRewardsPerDay = (
  farmId: number,
  farm: Contract | null | undefined,
  account: string | undefined
): string => {
  const { activeNetwork, currencyDecimals } = useNetwork()
  const poolStakedValue = parseUnits(usePoolStakedValue(farm), currencyDecimals)
  const userStakedValue = parseUnits(useUserStakedValue(farm, account), currencyDecimals)
  const { allocPoints, totalAllocPoints, solacePerBlock } = useMasterValues(farmId)

  return useMemo(() => {
    const allocPercentage = totalAllocPoints.gt(ZERO)
      ? floatUnits(allocPoints, currencyDecimals) / floatUnits(totalAllocPoints, currencyDecimals)
      : 0
    const poolPercentage = poolStakedValue.gt(ZERO)
      ? floatUnits(userStakedValue, currencyDecimals) / floatUnits(poolStakedValue, currencyDecimals)
      : 0
    const rewards = floatUnits(solacePerBlock, currencyDecimals) * allocPercentage * poolPercentage
    const formattedRewards = rewards.toString()
    return formattedRewards
  }, [allocPoints, totalAllocPoints, solacePerBlock, poolStakedValue, userStakedValue, activeNetwork])
}

export const useUserPendingRewards = (farm: Contract | null | undefined): string => {
  const { master } = useContracts()
  const { latestBlock } = useCachedData()
  const { account } = useWallet()
  const { currencyDecimals } = useNetwork()
  const [userRewards, setUserRewards] = useState<string>('0')

  useEffect(() => {
    const getUserPendingRewards = async () => {
      if (!farm || !master || !account) return
      try {
        const farms = await master.numFarms()
        if (farms.isZero()) return
        const pendingReward = await farm.pendingRewards(account)
        const formattedPendingReward = formatUnits(pendingReward, currencyDecimals)
        setUserRewards(formattedPendingReward)
      } catch (err) {
        console.log('getUserPendingRewards', err)
      }
    }
    getUserPendingRewards()
  }, [account, farm, master, latestBlock, currencyDecimals])

  return userRewards
}

export const useTotalPendingRewards = (): string => {
  const { cpFarm, lpFarm } = useContracts()
  const { currencyDecimals } = useNetwork()
  const cpUserRewards = useUserPendingRewards(cpFarm)
  const lpUserRewards = useUserPendingRewards(lpFarm)

  return useMemo(() => {
    const rewards = parseUnits(cpUserRewards, currencyDecimals).add(parseUnits(lpUserRewards, currencyDecimals))
    const formattedRewards = formatUnits(rewards, currencyDecimals)
    return formattedRewards
  }, [cpUserRewards, lpUserRewards, currencyDecimals])
}
