import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber, Contract } from 'ethers'
import { useCallback, useMemo } from 'react'
import { DEADLINE } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, VoteLock } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { getPermitErc20Signature } from '../../utils/signature'
import { useGetFunctionGas } from '../provider/useGas'

export const useUwLocker = () => {
  const { keyContracts } = useContracts()
  const { signer } = useProvider()
  const { activeNetwork } = useNetwork()
  const { uwLocker } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const locks = useCallback(
    async (lockId: BigNumber): Promise<VoteLock> => {
      if (!uwLocker) return {} as VoteLock
      try {
        const lock = await uwLocker.locks(lockId)
        return lock
      } catch (error) {
        console.error(error)
        return {} as VoteLock
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
    async (lockId: BigNumber): Promise<BigNumber> => {
      if (!uwLocker) return ZERO
      try {
        const withdrawInPartAmount = await uwLocker.getWithdrawInPartAmount(lockId)
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
    async (lockId: BigNumber): Promise<BigNumber> => {
      if (!uwLocker) return ZERO
      try {
        const burnOnWithdrawInPartAmount = await uwLocker.getBurnOnWithdrawInPartAmount(lockId)
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

  const createLock = useCallback(
    async (recipient: string, amount: BigNumber, end: BigNumber, tokenContract: Contract) => {
      if (!uwLocker || !signer) return { tx: null, localTx: null }
      const { v, r, s } = await getPermitErc20Signature(
        recipient,
        activeNetwork.chainId,
        signer,
        uwLocker.address,
        tokenContract,
        amount
      )
      const tx = await uwLocker.createLockSigned(amount, end, DEADLINE, v, r, s, {
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
    [activeNetwork.chainId, uwLocker, signer, gasConfig]
  )

  const increaseAmount = useCallback(
    async (recipient: string, lockId: BigNumber, amount: BigNumber, tokenContract: Contract) => {
      if (!uwLocker || !signer) return { tx: null, localTx: null }
      const { v, r, s } = await getPermitErc20Signature(
        recipient,
        activeNetwork.chainId,
        signer,
        uwLocker.address,
        tokenContract,
        amount
      )
      const tx = await uwLocker.increaseAmountSigned(lockId, amount, DEADLINE, v, r, s, {
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
    [activeNetwork.chainId, uwLocker, signer, gasConfig]
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
