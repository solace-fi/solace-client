import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useCallback, useMemo } from 'react'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, VoteLock } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useProvider } from '../../context/ProviderManager'
import { useGetFunctionGas } from '../provider/useGas'
import { useWeb3React } from '@web3-react/core'

export const useUwLocker = () => {
  const { keyContracts } = useContracts()
  const { account } = useWeb3React()
  const { signer } = useProvider()
  const { uwLocker } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const locks = useCallback(
    async (lockId: BigNumber): Promise<VoteLock> => {
      if (!uwLocker)
        return {
          amount: ZERO,
          end: ZERO,
        }
      try {
        const lock = await uwLocker.locks(lockId)
        return lock
      } catch (error) {
        console.error(error)
        return {
          amount: ZERO,
          end: ZERO,
        }
      }
    },
    [uwLocker]
  )

  const isLocked = useCallback(
    async (lockId: BigNumber): Promise<boolean> => {
      if (!uwLocker) return false
      try {
        const isLocked = await uwLocker.isLocked(lockId)
        return isLocked
      } catch (error) {
        console.error(error)
        return false
      }
    },
    [uwLocker]
  )

  const timeLeft = useCallback(
    async (lockId: BigNumber): Promise<BigNumber> => {
      if (!uwLocker) return ZERO
      try {
        const timeLeft = await uwLocker.timeLeft(lockId)
        return timeLeft
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwLocker]
  )

  const totalStakedBalance = useCallback(
    async (account: string): Promise<BigNumber> => {
      if (!uwLocker) return ZERO
      try {
        const totalStakedBalance = await uwLocker.totalStakedBalance(account)
        return totalStakedBalance
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwLocker]
  )

  const getWithdrawAmount = useCallback(
    async (lockId: BigNumber): Promise<BigNumber> => {
      if (!uwLocker) return ZERO
      try {
        const withdrawAmount = await uwLocker.getWithdrawAmount(lockId)
        return withdrawAmount
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwLocker]
  )

  const getWithdrawInPartAmount = useCallback(
    async (lockId: BigNumber, amount: BigNumber): Promise<BigNumber> => {
      if (!uwLocker) return ZERO
      try {
        const withdrawInPartAmount = await uwLocker.getWithdrawInPartAmount(lockId, amount)
        return withdrawInPartAmount
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwLocker]
  )

  const getBurnOnWithdrawAmount = useCallback(
    async (lockId: BigNumber): Promise<BigNumber> => {
      if (!uwLocker) return ZERO
      try {
        const burnOnWithdrawAmount = await uwLocker.getBurnOnWithdrawAmount(lockId)
        return burnOnWithdrawAmount
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwLocker]
  )

  const getBurnOnWithdrawInPartAmount = useCallback(
    async (lockId: BigNumber, amount: BigNumber): Promise<BigNumber> => {
      if (!uwLocker) return ZERO
      try {
        const burnOnWithdrawInPartAmount = await uwLocker.getBurnOnWithdrawInPartAmount(lockId, amount)
        return burnOnWithdrawInPartAmount
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwLocker]
  )

  const getAllLockIDsOf = useCallback(
    async (account: string): Promise<BigNumber[]> => {
      if (!uwLocker) return []
      try {
        const lockIDs = await uwLocker.getAllLockIDsOf(account)
        return lockIDs
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [uwLocker]
  )

  const minLockDuration = useCallback(async (): Promise<BigNumber> => {
    if (!uwLocker) return ZERO
    try {
      const minLockDuration = await uwLocker.MIN_LOCK_DURATION()
      return minLockDuration
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [uwLocker])

  const maxLockDuration = useCallback(async (): Promise<BigNumber> => {
    if (!uwLocker) return ZERO
    try {
      const maxLockDuration = await uwLocker.MAX_LOCK_DURATION()
      return maxLockDuration
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [uwLocker])

  const maxNumLocks = useCallback(async (): Promise<BigNumber> => {
    if (!uwLocker) return ZERO
    try {
      const maxNumLocks = await uwLocker.MAX_NUM_LOCKS()
      return maxNumLocks
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [uwLocker])

  const createLock = useCallback(
    async (amount: BigNumber, end: BigNumber) => {
      if (!uwLocker || !signer || !account) return { tx: null, localTx: null }
      const tx = await uwLocker.createLock(account, amount, end, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.CREATE_LOCK,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [account, uwLocker, signer, gasConfig]
  )

  const increaseAmount = useCallback(
    async (lockId: BigNumber, amount: BigNumber) => {
      if (!uwLocker || !signer) return { tx: null, localTx: null }
      const tx = await uwLocker.increaseAmountSigned(lockId, amount, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.INCREASE_AMOUNT,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [uwLocker, signer, gasConfig]
  )

  const increaseAmountMultiple = useCallback(
    async (lockIds: BigNumber[], amounts: BigNumber[]) => {
      if (!uwLocker) return { tx: null, localTx: null }
      const tx = await uwLocker.IncreaseAmountMultiple(lockIds, amounts, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.INCREASE_AMOUNT_MULTIPLE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLocker]
  )

  const extendLock = useCallback(
    async (lockId: BigNumber, end: BigNumber) => {
      if (!uwLocker) return { tx: null, localTx: null }
      const tx = await uwLocker.extendLock(lockId, end, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.EXTEND_LOCK,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLocker]
  )

  const extendLockMultiple = useCallback(
    async (lockIds: BigNumber[], ends: BigNumber[]) => {
      if (!uwLocker) return { tx: null, localTx: null }
      const tx = await uwLocker.extendLockMultiple(lockIds, ends, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.EXTEND_LOCK_MULTIPLE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLocker]
  )

  const withdraw = useCallback(
    async (lockId: BigNumber, recipient: string) => {
      if (!uwLocker) return { tx: null, localTx: null }
      const tx = await uwLocker.withdraw(lockId, recipient, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.WITHDRAW_LOCK,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLocker]
  )

  const withdrawInPart = useCallback(
    async (lockId: BigNumber, amount: BigNumber, recipient: string) => {
      if (!uwLocker) return { tx: null, localTx: null }
      const tx = await uwLocker.withdrawInPart(lockId, amount, recipient, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.WITHDRAW_LOCK_IN_PART,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLocker]
  )

  const withdrawMultiple = useCallback(
    async (lockIds: BigNumber[], recipient: string) => {
      if (!uwLocker) return { tx: null, localTx: null }
      const tx = await uwLocker.withdrawMultiple(lockIds, recipient, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.WITHDRAW_LOCK_MULTIPLE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLocker]
  )

  const withdrawInPartMultiple = useCallback(
    async (lockIds: BigNumber[], amounts: BigNumber[], recipient: string) => {
      if (!uwLocker) return { tx: null, localTx: null }
      const tx = await uwLocker.withdrawInPartMultiple(lockIds, amounts, recipient, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.WITHDRAW_LOCK_IN_PART_MULTIPLE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [gasConfig, uwLocker]
  )

  return {
    getAllLockIDsOf,
    minLockDuration,
    maxLockDuration,
    maxNumLocks,
    createLock,
    increaseAmount,
    increaseAmountMultiple,
    extendLock,
    extendLockMultiple,
    withdraw,
    withdrawInPart,
    withdrawMultiple,
    withdrawInPartMultiple,
    locks,
    isLocked,
    timeLeft,
    totalStakedBalance,
    getWithdrawAmount,
    getWithdrawInPartAmount,
    getBurnOnWithdrawAmount,
    getBurnOnWithdrawInPartAmount,
  }
}
