import { useEffect, useState, useMemo, useRef } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { LocalTx } from '../../constants/types'
import { ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { rangeFrom0 } from '../../utils/numeric'
import { useProvider } from '../../context/ProviderManager'
import { convertSciNotaToPrecise, truncateValue, formatAmount } from '../../utils/formatting'
import { useGetFunctionGas } from '../provider/useGas'
import { withBackoffRetries } from '../../utils/time'
import { useNetwork } from '../../context/NetworkManager'

import { Lock, Staker, GlobalLockInfo, Price } from '@solace-fi/sdk-nightly'
import { FunctionGasLimits } from '../../constants/mappings/gas'
import { useCachedData } from '../../context/CachedDataManager'

export const useStakingRewards = () => {
  const { provider, signer } = useProvider()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { stakingRewardsV2, xsLocker } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

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

  const harvestLockRewards = async (xsLockIDs: BigNumber[]) => {
    if (!stakingRewardsV2 || xsLockIDs.length == 0) return { tx: null, localTx: null }
    let tx = null
    let type = FunctionName.HARVEST_LOCK
    if (xsLockIDs.length > 1) {
      const estGas = await stakingRewardsV2.estimateGas.harvestLocks(xsLockIDs)
      console.log('stakingRewardsV2.estimateGas.harvestLocks', estGas.toString())
      tx = await stakingRewardsV2.harvestLocks(xsLockIDs, {
        ...gasConfig,
        gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      })
      type = FunctionName.HARVEST_LOCKS
    } else {
      const estGas = await stakingRewardsV2.estimateGas.harvestLock(xsLockIDs[0])
      console.log('stakingRewardsV2.estimateGas.harvestLock', estGas.toString())
      tx = await stakingRewardsV2.harvestLock(xsLockIDs[0], {
        ...gasConfig,
        gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      })
    }
    const localTx: LocalTx = {
      hash: tx.hash,
      type: type,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const compoundLockRewards = async (xsLockIDs: BigNumber[], multipleLocks: boolean, targetXsLockID?: BigNumber) => {
    if (!stakingRewardsV2 || xsLockIDs.length == 0) return { tx: null, localTx: null }
    let tx = null
    let type = FunctionName.COMPOUND_LOCK
    if (xsLockIDs.length > 1 && targetXsLockID && multipleLocks) {
      const estGas = await stakingRewardsV2.estimateGas.compoundLocks(xsLockIDs, targetXsLockID)
      console.log('stakingRewardsV2.estimateGas.compoundLocks', estGas.toString())
      tx = await stakingRewardsV2.compoundLocks(xsLockIDs, targetXsLockID, {
        ...gasConfig,
        gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      })
      type = FunctionName.COMPOUND_LOCKS
    } else {
      const estGas = await stakingRewardsV2.estimateGas.compoundLock(xsLockIDs[0])
      console.log('stakingRewardsV2.estimateGas.compoundLock', estGas.toString())
      tx = await stakingRewardsV2.compoundLock(xsLockIDs[0], {
        ...gasConfig,
        gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      })
    }
    const localTx: LocalTx = {
      hash: tx.hash,
      type: type,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const harvestLockRewardsForScp = async (xsLockIDs: BigNumber[]) => {
    if (xsLockIDs.length == 0 || !activeNetwork.config.generalFeatures.stakingRewardsV2)
      return { tx: null, localTx: null }
    const p = new Price()
    const priceInfo = await p.getPriceInfo()
    const signature = priceInfo.signatures[`${activeNetwork.chainId}`]
    if (!signature) return { tx: null, localTx: null }
    const tokenSignatureProps: any = Object.values(signature)[0]
    let tx = null
    let type = FunctionName.HARVEST_LOCK_FOR_SCP
    const staker = new Staker(activeNetwork.chainId, signer)
    if (xsLockIDs.length > 1) {
      tx = await staker.harvestLocksForScp(
        xsLockIDs,
        tokenSignatureProps.price,
        tokenSignatureProps.deadline,
        tokenSignatureProps.signature,
        {
          ...gasConfig,
          gasLimit: FunctionGasLimits['stakingRewards.harvestLocksForScp'],
        }
      )
      type = FunctionName.HARVEST_LOCKS_FOR_SCP
    } else {
      tx = await staker.harvestLockForScp(
        xsLockIDs[0],
        tokenSignatureProps.price,
        tokenSignatureProps.deadline,
        tokenSignatureProps.signature,
        {
          ...gasConfig,
          gasLimit: FunctionGasLimits['stakingRewards.harvestLockForScp'],
        }
      )
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
    harvestLockRewardsForScp,
    compoundLockRewards,
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
  const { staking } = useCachedData()
  const { globalLockStats, handleGlobalLockStats, canFetchGlobalStatsFlag, handleCanFetchGlobalStatsFlag } = staking
  const running = useRef<boolean>(false)

  const [projectedMultiplier, setProjectedMultiplier] = useState<string>('0')
  const [projectedApr, setProjectedApr] = useState<BigNumber>(ZERO)
  const [projectedYearlyReturns, setProjectedYearlyReturns] = useState<BigNumber>(ZERO)

  useEffect(() => {
    const _getGlobalLockStats = async () => {
      running.current = true
      const _globalLockStats: GlobalLockInfo = await getGlobalLockStats()
      handleGlobalLockStats(_globalLockStats)
      handleCanFetchGlobalStatsFlag(false)
      running.current = false
    }
    if (!running.current) {
      if (formatAmount(bnBalance) !== '0') {
        if (!globalLockStats.successfulFetch || canFetchGlobalStatsFlag) {
          _getGlobalLockStats()
        }
      }
    }
  }, [bnBalance, canFetchGlobalStatsFlag, globalLockStats])

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
