import { useState, useEffect, useCallback, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'
import { useReadToken } from './useToken'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { GasConfiguration, LocalTx } from '../constants/types'
import { GAS_LIMIT, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'

export const useStakingRewards = () => {
  const { keyContracts } = useContracts()
  const { stakingRewards } = useMemo(() => keyContracts, [keyContracts])

  const getPendingRewardsOfUser = async (account: string): Promise<BigNumber> => {
    if (!stakingRewards) return ZERO
    try {
      const pendingRewards = await stakingRewards.pendingRewardsOfUser(account)
      return pendingRewards
    } catch (err) {
      console.log('error getPendingRewardsOfUser ', err)
      return ZERO
    }
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

  const harvestUser = async (account: string, txVal: string, gasConfig: GasConfiguration) => {
    if (!stakingRewards) return
    const tx = await stakingRewards.harvestUser(account, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.HARVEST,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const harvestLocks = async (xsLockIDs: BigNumber[], txVal: string, gasConfig: GasConfiguration) => {
    if (!stakingRewards || xsLockIDs.length == 0) return
    let tx = null
    const gasSettings = {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    }
    if (xsLockIDs.length > 1) {
      tx = await stakingRewards.harvestLocks(xsLockIDs, gasSettings)
    } else {
      tx = await stakingRewards.harvestLock(xsLockIDs[0], gasSettings)
    }
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.HARVEST,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { getPendingRewardsOfUser, getPendingRewardsOfLock, getStakedLockInfo, harvestUser, harvestLocks }
}
