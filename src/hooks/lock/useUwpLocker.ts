import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber, Contract } from 'ethers'
import { useMemo } from 'react'
import { DEADLINE } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, VoteLock } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { getPermitErc20Signature } from '../../utils/signature'
import { useGetFunctionGas } from '../provider/useGas'

export const useUwpLocker = () => {
  const { keyContracts } = useContracts()
  const { signer } = useProvider()
  const { activeNetwork } = useNetwork()
  const { uwpLocker } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const locks = async (lockId: BigNumber): Promise<VoteLock> => {
    if (!uwpLocker) return {} as VoteLock
    try {
      const lock = await uwpLocker.locks(lockId)
      return lock
    } catch (error) {
      console.error(error)
      return {} as VoteLock
    }
  }

  const isLocked = async (lockId: BigNumber): Promise<boolean> => {
    if (!uwpLocker) return false
    try {
      const isLocked = await uwpLocker.isLocked(lockId)
      return isLocked
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const timeLeft = async (lockId: BigNumber): Promise<BigNumber> => {
    if (!uwpLocker) return ZERO
    try {
      const timeLeft = await uwpLocker.timeLeft(lockId)
      return timeLeft
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const totalStakedBalance = async (account: string): Promise<BigNumber> => {
    if (!uwpLocker) return ZERO
    try {
      const totalStakedBalance = await uwpLocker.totalStakedBalance(account)
      return totalStakedBalance
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getWithdrawAmount = async (lockId: BigNumber): Promise<BigNumber> => {
    if (!uwpLocker) return ZERO
    try {
      const withdrawAmount = await uwpLocker.getWithdrawAmount(lockId)
      return withdrawAmount
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getWithdrawInPartAmount = async (lockId: BigNumber): Promise<BigNumber> => {
    if (!uwpLocker) return ZERO
    try {
      const withdrawInPartAmount = await uwpLocker.getWithdrawInPartAmount(lockId)
      return withdrawInPartAmount
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getBurnOnWithdrawAmount = async (lockId: BigNumber): Promise<BigNumber> => {
    if (!uwpLocker) return ZERO
    try {
      const burnOnWithdrawAmount = await uwpLocker.getBurnOnWithdrawAmount(lockId)
      return burnOnWithdrawAmount
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getBurnOnWithdrawInPartAmount = async (lockId: BigNumber): Promise<BigNumber> => {
    if (!uwpLocker) return ZERO
    try {
      const burnOnWithdrawInPartAmount = await uwpLocker.getBurnOnWithdrawInPartAmount(lockId)
      return burnOnWithdrawInPartAmount
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const getAllLockIDsOf = async (account: string): Promise<BigNumber[]> => {
    if (!uwpLocker) return []
    try {
      const lockIDs = await uwpLocker.getAllLockIDsOf(account)
      return lockIDs
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const createLock = async (recipient: string, amount: BigNumber, end: BigNumber, tokenContract: Contract) => {
    if (!uwpLocker || !signer) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(
      recipient,
      activeNetwork.chainId,
      signer,
      uwpLocker.address,
      tokenContract,
      amount
    )
    const tx = await uwpLocker.createLockSigned(amount, end, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.CREATE_LOCK,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const increaseAmount = async (recipient: string, lockId: BigNumber, amount: BigNumber, tokenContract: Contract) => {
    if (!uwpLocker || !signer) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(
      recipient,
      activeNetwork.chainId,
      signer,
      uwpLocker.address,
      tokenContract,
      amount
    )
    const tx = await uwpLocker.increaseAmountSigned(lockId, amount, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.INCREASE_AMOUNT,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const increaseAmountMultiple = async (lockIds: BigNumber[], amounts: BigNumber[]) => {
    if (!uwpLocker) return { tx: null, localTx: null }
    const tx = await uwpLocker.IncreaseAmountMultiple(lockIds, amounts, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.INCREASE_AMOUNT_MULTIPLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const extendLock = async (lockId: BigNumber, end: BigNumber) => {
    if (!uwpLocker) return { tx: null, localTx: null }
    const tx = await uwpLocker.extendLock(lockId, end, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.EXTEND_LOCK,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const extendLockMultiple = async (lockIds: BigNumber[], ends: BigNumber[]) => {
    if (!uwpLocker) return { tx: null, localTx: null }
    const tx = await uwpLocker.extendLockMultiple(lockIds, ends, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.EXTEND_LOCK_MULTIPLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdraw = async (lockId: BigNumber, recipient: string) => {
    if (!uwpLocker) return { tx: null, localTx: null }
    const tx = await uwpLocker.withdraw(lockId, recipient, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_LOCK,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawInPart = async (lockId: BigNumber, amount: BigNumber, recipient: string) => {
    if (!uwpLocker) return { tx: null, localTx: null }
    const tx = await uwpLocker.withdrawInPart(lockId, amount, recipient, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_LOCK_IN_PART,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawMultiple = async (lockIds: BigNumber[], recipient: string) => {
    if (!uwpLocker) return { tx: null, localTx: null }
    const tx = await uwpLocker.withdrawMultiple(lockIds, recipient, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_LOCK_MULTIPLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawInPartMultiple = async (lockIds: BigNumber[], amounts: BigNumber[], recipient: string) => {
    if (!uwpLocker) return { tx: null, localTx: null }
    const tx = await uwpLocker.withdrawInPartMultiple(lockIds, amounts, recipient, {
      ...gasConfig,
      gasLimit: 800000,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_LOCK_IN_PART_MULTIPLE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

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
