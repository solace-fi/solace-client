import { useEffect, useState, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { GlobalLockInfo, LocalTx } from '../constants/types'
import { ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { rangeFrom0 } from '../utils/numeric'
import { FunctionGasLimits } from '../constants/mappings/gasMapping'
import { useProvider } from '../context/ProviderManager'
import { convertSciNotaToPrecise, truncateValue, formatAmount } from '../utils/formatting'
import { useGetFunctionGas } from './useGas'

export const useStakingRewards = () => {
  const { keyContracts } = useContracts()
  const { stakingRewards, xsLocker } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

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

  const getGlobalLockStats = async (blockNum: number): Promise<GlobalLockInfo> => {
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
      stakingRewards.rewardPerSecond({ blockTag: blockNum }), // across all locks
      stakingRewards.valueStaked({ blockTag: blockNum }), // across all locks
      xsLocker.totalSupply({ blockTag: blockNum }),
    ])
    const indices = rangeFrom0(numlocks.toNumber())
    const xsLockIDs = await Promise.all(
      indices.map(async (index) => {
        return await xsLocker.tokenByIndex(index, { blockTag: blockNum })
      })
    )
    const locks = await Promise.all(
      xsLockIDs.map(async (xsLockID) => {
        return await xsLocker.locks(xsLockID, { blockTag: blockNum })
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

  const harvestLockRewards = async (xsLockIDs: BigNumber[]) => {
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

  const compoundLockRewards = async (xsLockIDs: BigNumber[], targetXsLockID?: BigNumber) => {
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

export const useProjectedBenefits = (
  bnBalance: string,
  lockEnd: number
): {
  projectedMultiplier: string
  projectedApy: BigNumber
  projectedYearlyReturns: BigNumber
} => {
  const { getGlobalLockStats } = useStakingRewards()
  const { latestBlock } = useProvider()

  const [projectedMultiplier, setProjectedMultiplier] = useState<string>('0')
  const [projectedApy, setProjectedApy] = useState<BigNumber>(ZERO)
  const [projectedYearlyReturns, setProjectedYearlyReturns] = useState<BigNumber>(ZERO)
  const [globalLockStats, setGlobalLockStats] = useState<GlobalLockInfo>({
    solaceStaked: ZERO,
    valueStaked: ZERO,
    numLocks: ZERO,
    rewardPerSecond: ZERO,
    apy: ZERO,
  })

  useEffect(() => {
    if (!latestBlock) return
    const _getGlobalLockStats = async () => {
      const globalLockStats: GlobalLockInfo = await getGlobalLockStats(latestBlock.number)
      setGlobalLockStats(globalLockStats)
    }
    _getGlobalLockStats()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestBlock])

  useEffect(() => {
    if (!latestBlock) return

    let rewardMultiplier = 1.0
    if (lockEnd > latestBlock.timestamp) rewardMultiplier += (1.5 * (lockEnd - latestBlock.timestamp)) / (31536000 * 4)
    const preciseMultiplier = convertSciNotaToPrecise(`${Math.floor(rewardMultiplier * parseFloat(bnBalance))}`)
    const boostedValue = BigNumber.from(preciseMultiplier)

    const newValueStaked = globalLockStats.valueStaked.add(boostedValue)
    const projectedYearlyReturns = newValueStaked.gt(ZERO)
      ? globalLockStats.rewardPerSecond.mul(31536000).mul(boostedValue).div(newValueStaked)
      : ZERO
    const formattedStakeValue = formatAmount(formatUnits(BigNumber.from(bnBalance)))
    const parsedStakeValue = parseUnits(parseFloat(formattedStakeValue) == 0 ? '0' : formattedStakeValue, 18)
    const projectedApy = parsedStakeValue.gt(0) ? projectedYearlyReturns.mul(100).div(parsedStakeValue) : ZERO

    const strRewardMultiplier = truncateValue(rewardMultiplier.toString(), 2)
    setProjectedMultiplier(strRewardMultiplier)
    setProjectedApy(projectedApy)
    setProjectedYearlyReturns(projectedYearlyReturns)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalLockStats, lockEnd, bnBalance])

  return { projectedMultiplier, projectedApy, projectedYearlyReturns }
}
