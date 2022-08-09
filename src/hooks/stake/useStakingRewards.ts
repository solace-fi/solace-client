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
