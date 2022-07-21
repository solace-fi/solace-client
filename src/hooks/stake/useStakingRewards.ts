import { useEffect, useState, useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ZERO } from '../../constants'
import { rangeFrom0 } from '../../utils/numeric'
import { useProvider } from '../../context/ProviderManager'
import { convertSciNotaToPrecise, truncateValue, formatAmount } from '../../utils/formatting'
import { withBackoffRetries } from '../../utils/time'
import { useNetwork } from '../../context/NetworkManager'

import { Lock, GlobalLockInfo } from '@solace-fi/sdk-nightly'
import { useCachedData } from '../../context/CachedDataManager'

export const useStakingRewards = () => {
  const { provider } = useProvider()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { stakingRewardsV2, xsLocker } = useMemo(() => keyContracts, [keyContracts])

  const getUserPendingRewards = async (account: string) => {
    let pendingRewards = ZERO
    if (!xsLocker || !stakingRewardsV2) return pendingRewards
    const numLocks = await withBackoffRetries(async () => xsLocker.balanceOf(account))
    const indices = rangeFrom0(numLocks.toNumber())
    const xsLockIDs = await Promise.all(
      indices.map(async (index) => {
        return await withBackoffRetries(async () => xsLocker.tokenOfOwnerByIndex(account, index))
      })
    )
    const rewards = await Promise.all(
      xsLockIDs.map(async (xsLockID) => {
        return await getPendingRewardsOfLock(xsLockID)
      })
    )
    rewards.forEach((reward) => {
      pendingRewards = pendingRewards.add(reward)
    })
    return pendingRewards
  }

  const getPendingRewardsOfLock = async (xsLockID: BigNumber): Promise<BigNumber> => {
    if (!stakingRewardsV2) return ZERO
    try {
      const pendingRewards = await withBackoffRetries(async () => stakingRewardsV2.pendingRewardsOfLock(xsLockID))
      return pendingRewards
    } catch (err) {
      console.log('error getPendingRewardsOfLock ', err)
      return ZERO
    }
  }

  const getStakedLockInfo = async (xsLockID: BigNumber) => {
    if (!stakingRewardsV2) return null
    try {
      const userInfo = await withBackoffRetries(async () => stakingRewardsV2.stakedLockInfo(xsLockID))
      return userInfo
    } catch (err) {
      console.log('error getStakedLockInfo ', err)
      return null
    }
  }

  const getGlobalLockStats = async (): Promise<GlobalLockInfo> => {
    if (provider) {
      const lock = new Lock(activeNetwork.chainId, provider)
      const stats = await lock.getGlobalLockStats()
      return stats
    }
    return {
      solaceStaked: '0',
      valueStaked: '0',
      numLocks: '0',
      rewardPerSecond: '0',
      apr: '0',
      successfulFetch: false,
    }
  }

  return {
    getUserPendingRewards,
    getPendingRewardsOfLock,
    getStakedLockInfo,
    getGlobalLockStats,
  }
}

export const useProjectedBenefits = (
  bnBalance: string,
  lockEnd: number
): {
  projectedMultiplier: string
  projectedApr: BigNumber
  projectedYearlyReturns: BigNumber
} => {
  const { getGlobalLockStats } = useStakingRewards()
  const { latestBlock } = useProvider()
  const { minute } = useCachedData()

  const [projectedMultiplier, setProjectedMultiplier] = useState<string>('0')
  const [projectedApr, setProjectedApr] = useState<BigNumber>(ZERO)
  const [projectedYearlyReturns, setProjectedYearlyReturns] = useState<BigNumber>(ZERO)
  const [globalLockStats, setGlobalLockStats] = useState<GlobalLockInfo>({
    solaceStaked: '0',
    valueStaked: '0',
    numLocks: '0',
    rewardPerSecond: '0',
    apr: '0',
    successfulFetch: false,
  })

  useEffect(() => {
    const _getGlobalLockStats = async () => {
      const globalLockStats: GlobalLockInfo = await getGlobalLockStats()
      setGlobalLockStats(globalLockStats)
    }
    _getGlobalLockStats()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute])

  useEffect(() => {
    if (!latestBlock) return

    let rewardMultiplier = 1.0
    if (lockEnd > latestBlock.timestamp) rewardMultiplier += (1.5 * (lockEnd - latestBlock.timestamp)) / (31536000 * 4)
    const preciseMultiplier = convertSciNotaToPrecise(`${Math.floor(rewardMultiplier * parseFloat(bnBalance))}`)
    const boostedValue = BigNumber.from(preciseMultiplier)

    const newValueStaked = parseUnits(globalLockStats.valueStaked, 18).add(boostedValue)
    const projectedYearlyReturns = newValueStaked.gt(ZERO)
      ? parseUnits(globalLockStats.rewardPerSecond, 18).mul(31536000).mul(boostedValue).div(newValueStaked)
      : ZERO
    const formattedStakeValue = formatAmount(formatUnits(BigNumber.from(bnBalance)))
    const parsedStakeValue = parseUnits(parseFloat(formattedStakeValue) == 0 ? '0' : formattedStakeValue, 18)
    const projectedApr = parsedStakeValue.gt(0) ? projectedYearlyReturns.mul(100).div(parsedStakeValue) : ZERO

    const strRewardMultiplier = truncateValue(rewardMultiplier.toString(), 2)
    setProjectedMultiplier(strRewardMultiplier)
    setProjectedApr(projectedApr)
    setProjectedYearlyReturns(projectedYearlyReturns)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalLockStats, lockEnd, bnBalance])

  return { projectedMultiplier, projectedApr, projectedYearlyReturns }
}
