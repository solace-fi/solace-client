import { useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'
import { useReadToken } from './useToken'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { GasConfiguration, LocalTx, LockData, UserLocksData, UserLocksInfo } from '../constants/types'
import { getPermitErc20Signature } from '../utils/signature'
import { DEADLINE, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { useProvider } from '../context/ProviderManager'
import { rangeFrom0 } from '../utils/numeric'
import { FunctionGasLimits } from '../constants/mappings/gasMapping'
import { queryDecimals } from '../utils/contract'

export const useXSLocker = () => {
  const { keyContracts } = useContracts()
  const { xsLocker, solace } = useMemo(() => keyContracts, [keyContracts])
  const { library } = useWallet()
  const { chainId } = useNetwork()
  const { latestBlock } = useProvider()
  const readToken = useReadToken(solace)

  const getLock = async (xsLockID: BigNumber) => {
    if (!xsLocker) return null
    try {
      const lock = await xsLocker.locks(xsLockID)
      return lock
    } catch (err) {
      console.log('error getLock ', xsLockID.toString(), err)
      return null
    }
  }

  const getIsLocked = async (xsLockID: BigNumber): Promise<boolean> => {
    if (!xsLocker) return false
    try {
      const lock = await xsLocker.isLocked(xsLockID)
      return lock
    } catch (err) {
      console.log('error getIsLocked ', xsLockID.toString(), err)
      return false
    }
  }

  const getTimeLeft = async (xsLockID: BigNumber): Promise<BigNumber> => {
    if (!xsLocker) return ZERO
    try {
      const lock = await xsLocker.timeLeft(xsLockID)
      return lock
    } catch (err) {
      console.log('error getTimeLeft ', xsLockID.toString(), err)
      return ZERO
    }
  }

  const getStakedBalance = async (account: string) => {
    if (!xsLocker) return '0'
    try {
      const stakedBalance = await xsLocker.stakedBalance(account)
      const formattedStakedBalance = formatUnits(stakedBalance, readToken.decimals)
      return formattedStakedBalance
    } catch (err) {
      console.log('error getStakedBalance ', err)
      return '0'
    }
  }

  const createLock = async (recipient: string, amount: BigNumber, end: BigNumber, gasConfig: GasConfiguration) => {
    if (!xsLocker || !solace) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(recipient, chainId, library, xsLocker.address, solace, amount)
    const tx = await xsLocker.createLockSigned(amount, end, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xsLocker.createLockSigned'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.CREATE_LOCK,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const increaseLockAmount = async (
    recipient: string,
    xsLockID: BigNumber,
    amount: BigNumber,
    gasConfig: GasConfiguration
  ) => {
    if (!xsLocker || !solace) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(recipient, chainId, library, xsLocker.address, solace, amount)
    const tx = await xsLocker.increaseAmountSigned(xsLockID, amount, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xsLocker.increaseAmountSigned'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.INCREASE_LOCK_AMOUNT,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const extendLock = async (xsLockID: BigNumber, end: BigNumber, gasConfig: GasConfiguration) => {
    if (!xsLocker || !solace) return { tx: null, localTx: null }
    const tx = await xsLocker.extendLock(xsLockID, end, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xsLocker.extendLock'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.EXTEND_LOCK,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawFromLock = async (
    recipient: string,
    xsLockIDs: BigNumber[],
    gasConfig: GasConfiguration,
    amount?: BigNumber
  ) => {
    if (!xsLocker || !solace || xsLockIDs.length == 0) return { tx: null, localTx: null }
    let tx = null
    let type = FunctionName.WITHDRAW_IN_PART_FROM_LOCK
    if (amount) {
      tx = await xsLocker.withdrawInPart(xsLockIDs[0], recipient, amount, {
        ...gasConfig,
        gasLimit: FunctionGasLimits['xsLocker.withdrawInPart'],
      })
    } else if (xsLockIDs.length > 1) {
      tx = await xsLocker.withdrawMany(xsLockIDs, recipient, {
        ...gasConfig,
        gasLimit: FunctionGasLimits['xsLocker.withdrawMany'],
      })
      type = FunctionName.WITHDRAW_MANY_FROM_LOCK
    } else {
      tx = await xsLocker.withdraw(xsLockIDs[0], recipient, {
        ...gasConfig,
        gasLimit: FunctionGasLimits['xsLocker.withdraw'],
      })
      type = FunctionName.WITHDRAW_FROM_LOCK
    }

    const localTx: LocalTx = {
      hash: tx.hash,
      type: type,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const getUserLockerBalances = async (account: string) => {
    if (!latestBlock || !xsLocker) return { stakedBalance: '0', lockedBalance: '0', unlockedBalance: '0' }
    const timestamp: number = latestBlock.timestamp
    let stakedBalance = ZERO // staked = locked + unlocked
    let lockedBalance = ZERO
    let unlockedBalance = ZERO
    const numLocks = await xsLocker.balanceOf(account)
    const indices = rangeFrom0(numLocks.toNumber())
    const xsLockIDs = await Promise.all(
      indices.map(async (index) => {
        return await xsLocker.tokenOfOwnerByIndex(account, index)
      })
    )
    const locks = await Promise.all(
      xsLockIDs.map(async (xsLockID) => {
        return await xsLocker.locks(xsLockID)
      })
    )
    locks.forEach((lock) => {
      stakedBalance = stakedBalance.add(lock.amount)
      if (lock.end.gt(timestamp)) lockedBalance = lockedBalance.add(lock.amount)
      else unlockedBalance = unlockedBalance.add(lock.amount)
    })

    return {
      stakedBalance: formatUnits(stakedBalance, readToken.decimals),
      lockedBalance: formatUnits(lockedBalance, readToken.decimals),
      unlockedBalance: formatUnits(unlockedBalance, readToken.decimals),
    }
  }

  return {
    createLock,
    increaseLockAmount,
    extendLock,
    withdrawFromLock,
    getStakedBalance,
    getLock,
    getIsLocked,
    getTimeLeft,
    getUserLockerBalances,
  }
}

export const useUserLockData = () => {
  const { latestBlock } = useProvider()
  const { keyContracts } = useContracts()
  const { xsLocker, stakingRewards, solace } = useMemo(() => keyContracts, [keyContracts])

  const getUserLocks = async (user: string): Promise<UserLocksData> => {
    if (!latestBlock || !stakingRewards || !xsLocker || !solace)
      return {
        user: {
          pendingRewards: ZERO,
          stakedBalance: ZERO,
          lockedBalance: ZERO,
          unlockedBalance: ZERO,
          yearlyReturns: ZERO,
          apy: ZERO,
        },
        locks: [],
      }
    const timestamp = latestBlock.timestamp
    let stakedBalance = ZERO // staked = locked + unlocked
    let lockedBalance = ZERO // measured in SOLACE
    let unlockedBalance = ZERO
    let pendingRewards = ZERO
    let userValue = ZERO // measured in SOLACE * rewards multiplier
    const [rewardPerSecond, valueStaked, numLocks] = await Promise.all([
      stakingRewards.rewardPerSecond(), // across all locks
      stakingRewards.valueStaked(), // across all locks from all users
      xsLocker.balanceOf(user),
    ])
    const indices = rangeFrom0(numLocks)
    const xsLockIDs = await Promise.all(
      indices.map(async (index) => {
        return await xsLocker.tokenOfOwnerByIndex(user, index)
      })
    )
    const locks: LockData[] = await Promise.all(
      xsLockIDs.map(async (xsLockID) => {
        const rewards: BigNumber = await stakingRewards.pendingRewardsOfLock(xsLockID)
        const lock = await xsLocker.locks(xsLockID)
        const timeLeft: BigNumber = lock.end.gt(timestamp) ? lock.end.sub(timestamp) : ZERO
        const stakedLock = await stakingRewards.stakedLockInfo(xsLockID)
        const yearlyReturns: BigNumber = valueStaked.gt(ZERO)
          ? rewardPerSecond.mul(BigNumber.from(31536000)).mul(stakedLock.value).div(valueStaked)
          : ZERO
        const apy: BigNumber = lock.amount.gt(ZERO) ? yearlyReturns.mul(100).div(lock.amount) : ZERO
        const _lock: LockData = {
          xsLockID: xsLockID,
          unboostedAmount: lock.amount,
          end: lock.end,
          timeLeft: timeLeft,
          boostedValue: stakedLock.value,
          pendingRewards: rewards,
          apy: apy,
        }
        return _lock
      })
    )
    locks.forEach((lock) => {
      pendingRewards = pendingRewards.add(lock.pendingRewards)
      stakedBalance = stakedBalance.add(lock.unboostedAmount)
      if (lock.end.gt(timestamp)) lockedBalance = lockedBalance.add(lock.unboostedAmount)
      else unlockedBalance = unlockedBalance.add(lock.unboostedAmount)
      userValue = userValue.add(lock.boostedValue)
    })
    const userYearlyReturns: BigNumber = valueStaked.gt(ZERO)
      ? rewardPerSecond.mul(BigNumber.from(31536000)).mul(userValue).div(valueStaked)
      : ZERO
    const userApy: BigNumber = stakedBalance.gt(ZERO) ? userYearlyReturns.mul(100).div(stakedBalance) : ZERO
    const userInfo: UserLocksInfo = {
      pendingRewards: pendingRewards,
      stakedBalance: stakedBalance,
      lockedBalance: lockedBalance,
      unlockedBalance: unlockedBalance,
      yearlyReturns: userYearlyReturns,
      apy: userApy,
    }
    const data = {
      user: userInfo,
      locks: locks,
    }
    return data
  }

  return { getUserLocks }
}
