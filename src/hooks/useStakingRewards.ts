import { useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { BigNumber } from 'ethers'
import { GasConfiguration, GlobalLockInfo, LocalTx } from '../constants/types'
import { ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { rangeFrom0 } from '../utils/numeric'
import { FunctionGasLimits } from '../constants/mappings/gasMapping'

export const useStakingRewards = () => {
  const { keyContracts } = useContracts()
  const { stakingRewards, xsLocker } = useMemo(() => keyContracts, [keyContracts])

  const getUserPendingRewards = async (account: string) => {
    let pendingRewards = ZERO
    if (!xsLocker || !stakingRewards) return pendingRewards
    const numLocks = await xsLocker.balanceOf(account)
    const indices = rangeFrom0(numLocks.toNumber())
    const xsLockIDs = await Promise.all(
      indices.map(async (index) => {
        return await xsLocker.tokenOfOwnerByIndex(account, index)
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
    if (!stakingRewards) return ZERO
    try {
      const pendingRewards = await stakingRewards.pendingRewardsOfLock(xsLockID)
      return pendingRewards
    } catch (err) {
      console.log('error getPendingRewardsOfLock ', err)
      return ZERO
    }
  }

  const getStakedLockInfo = async (xsLockID: BigNumber) => {
    if (!stakingRewards) return null
    try {
      const userInfo = await stakingRewards.stakedLockInfo(xsLockID)
      return userInfo
    } catch (err) {
      console.log('error getStakedLockInfo ', err)
      return null
    }
  }

  const getGlobalLockStats = async (): Promise<GlobalLockInfo> => {
    if (!stakingRewards || !xsLocker)
      return {
        solaceStaked: ZERO,
        valueStaked: ZERO,
        numLocks: ZERO,
        rewardPerSecond: ZERO,
        apy: ZERO,
      }
    let totalSolaceStaked = ZERO
    const [rewardPerSecond, valueStaked, numlocks] = await Promise.all([
      stakingRewards.rewardPerSecond(), // across all locks
      stakingRewards.valueStaked(), // across all locks
      xsLocker.totalSupply(),
    ])
    const indices = rangeFrom0(numlocks.toNumber())
    const xsLockIDs = await Promise.all(
      indices.map(async (index) => {
        return await xsLocker.tokenByIndex(index)
      })
    )
    const locks = await Promise.all(
      xsLockIDs.map(async (xsLockID) => {
        return await xsLocker.locks(xsLockID)
      })
    )
    locks.forEach((lock) => {
      totalSolaceStaked = totalSolaceStaked.add(lock.amount)
    })
    const apy = totalSolaceStaked.gt(0)
      ? rewardPerSecond.mul(BigNumber.from(31536000)).mul(BigNumber.from(100)).div(totalSolaceStaked)
      : BigNumber.from(1000)
    return {
      solaceStaked: totalSolaceStaked,
      valueStaked: valueStaked,
      numLocks: numlocks,
      rewardPerSecond: rewardPerSecond,
      apy: apy, // individual lock apy may be up to 2.5x this
    }
  }

  const harvestLockRewards = async (xsLockIDs: BigNumber[], gasConfig: GasConfiguration) => {
    if (!stakingRewards || xsLockIDs.length == 0) return { tx: null, localTx: null }
    let tx = null
    let type = FunctionName.HARVEST_LOCK
    if (xsLockIDs.length > 1) {
      tx = await stakingRewards.harvestLocks(xsLockIDs, {
        ...gasConfig,
        gasLimit: FunctionGasLimits['stakingRewards.harvestLocks'],
      })
      type = FunctionName.HARVEST_LOCKS
    } else {
      tx = await stakingRewards.harvestLock(xsLockIDs[0], {
        ...gasConfig,
        gasLimit: FunctionGasLimits['stakingRewards.harvestLock'],
      })
    }
    const localTx: LocalTx = {
      hash: tx.hash,
      type: type,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const compoundLockRewards = async (
    xsLockIDs: BigNumber[],
    gasConfig: GasConfiguration,
    targetXsLockID?: BigNumber
  ) => {
    if (!stakingRewards || xsLockIDs.length == 0) return { tx: null, localTx: null }
    let tx = null
    let type = FunctionName.COMPOUND_LOCK
    if (xsLockIDs.length > 1 && targetXsLockID) {
      tx = await stakingRewards.compoundLocks(xsLockIDs, targetXsLockID, {
        ...gasConfig,
        gasLimit: FunctionGasLimits['stakingRewards.compoundLocks'],
      })
      type = FunctionName.COMPOUND_LOCKS
    } else {
      tx = await stakingRewards.compoundLock(xsLockIDs[0], {
        ...gasConfig,
        gasLimit: FunctionGasLimits['stakingRewards.compoundLock'],
      })
    }
    const localTx: LocalTx = {
      hash: tx.hash,
      type: type,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return {
    getUserPendingRewards,
    getPendingRewardsOfLock,
    getStakedLockInfo,
    getGlobalLockStats,
    harvestLockRewards,
    compoundLockRewards,
  }
}
