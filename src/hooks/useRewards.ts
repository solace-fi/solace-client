import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/Web3Manager'
import { usePoolStakedValue } from './usePoolStakedValue'
import { formatEther, parseEther } from '@ethersproject/units'
import { NUM_BLOCKS_PER_DAY, ZERO } from '../constants'
import { Contract } from '@ethersproject/contracts'
import { useUserStakedValue } from './useUserStakedValue'

const useMasterValues = (farmId: number) => {
  const { master } = useContracts()
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
  }, [farmId, master])
  return [masterValues]
}

export const useRewardsPerDay = (farmId: number) => {
  const [{ allocPoints, totalAllocPoints, solacePerBlock }] = useMasterValues(farmId)
  const [rewardsPerDay, setRewardsPerDay] = useState<string>('0.00')

  useEffect(() => {
    const getRewardsPerDay = async () => {
      try {
        const rewards = totalAllocPoints.gt(ZERO)
          ? solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(allocPoints).div(totalAllocPoints)
          : ZERO
        const formattedRewards = formatEther(rewards)
        setRewardsPerDay(formattedRewards)
      } catch (err) {
        console.log('getRewardsPerDay', err)
      }
    }
    getRewardsPerDay()
  }, [allocPoints, totalAllocPoints, solacePerBlock])
  return [rewardsPerDay]
}

export const useUserRewardsPerDay = (farmId: number, farm: Contract | null | undefined) => {
  const poolStakedValue = parseEther(usePoolStakedValue(farm))
  const userStakedValue = parseEther(useUserStakedValue(farm))
  const [{ allocPoints, totalAllocPoints, solacePerBlock }] = useMasterValues(farmId)
  const [userRewardsPerDay, setUserRewardsPerDay] = useState<string>('0.00')

  useEffect(() => {
    const getUserRewardsPerDay = async () => {
      try {
        const allocPercentage = totalAllocPoints.gt(ZERO) ? allocPoints.div(totalAllocPoints) : ZERO
        const poolPercentage = poolStakedValue.gt(ZERO) ? userStakedValue.div(poolStakedValue) : ZERO
        const rewards = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(allocPercentage).mul(poolPercentage)

        const formattedRewards = formatEther(rewards)
        setUserRewardsPerDay(formattedRewards)
      } catch (err) {
        console.log('getUserRewardsPerDay', err)
      }
    }
    getUserRewardsPerDay()
  }, [allocPoints, totalAllocPoints, solacePerBlock, farm, poolStakedValue, userStakedValue])

  return [userRewardsPerDay]
}

export const useUserPendingRewards = (farm: Contract | null | undefined) => {
  const { master } = useContracts()
  const wallet = useWallet()
  const [userRewards, setUserRewards] = useState<string>('0.00')

  useEffect(() => {
    const getUserPendingRewards = async () => {
      if (!farm || !master || !wallet.account) return
      try {
        const farms = await master.numFarms()
        if (farms.isZero()) return
        const pendingReward = await farm.pendingRewards(wallet.account)
        const formattedPendingReward = formatEther(pendingReward)
        setUserRewards(formattedPendingReward)
      } catch (err) {
        console.log('getUserPendingRewards', err)
      }
    }
    getUserPendingRewards()
  }, [wallet, farm, master])

  return [userRewards]
}

export const useTotalPendingRewards = () => {
  const { cpFarm, lpFarm } = useContracts()
  const [totalPendingRewards, setTotalPendingRewards] = useState<string>('0.00')
  const [cpUserRewards] = useUserPendingRewards(cpFarm)
  const [lpUserRewards] = useUserPendingRewards(lpFarm)

  useEffect(() => {
    const rewards = parseEther(cpUserRewards).add(parseEther(lpUserRewards))
    const formattedRewards = formatEther(rewards)
    setTotalPendingRewards(formattedRewards)
  }, [cpUserRewards, lpUserRewards])

  return totalPendingRewards
}
