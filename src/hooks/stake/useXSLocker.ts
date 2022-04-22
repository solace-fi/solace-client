import { useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { LocalTx, LockData, UserLocksData, UserLocksInfo } from '../../constants/types'
import { getPermitErc20Signature } from '../../utils/signature'
import { DEADLINE, ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { useGetFunctionGas } from '../provider/useGas'
import { withBackoffRetries } from '../../utils/time'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { Lock } from '@solace-fi/sdk-nightly'

export const useXSLocker = () => {
  const { keyContracts } = useContracts()
  const { xsLocker, solace } = useMemo(() => keyContracts, [keyContracts])
  const { library } = useWallet()
  const { chainId } = useNetwork()
  const { gasConfig } = useGetFunctionGas()

  const getLock = async (xsLockID: BigNumber) => {
    if (!xsLocker) return null
    try {
      const lock = await withBackoffRetries(async () => xsLocker.locks(xsLockID))
      return lock
    } catch (err) {
      console.log('error getLock ', xsLockID.toString(), err)
      return null
    }
  }

  const getIsLocked = async (xsLockID: BigNumber): Promise<boolean> => {
    if (!xsLocker) return false
    try {
      const lock = await withBackoffRetries(async () => xsLocker.isLocked(xsLockID))
      return lock
    } catch (err) {
      console.log('error getIsLocked ', xsLockID.toString(), err)
      return false
    }
  }

  const getTimeLeft = async (xsLockID: BigNumber): Promise<BigNumber> => {
    if (!xsLocker) return ZERO
    try {
      const lock = await withBackoffRetries(async () => xsLocker.timeLeft(xsLockID))
      return lock
    } catch (err) {
      console.log('error getTimeLeft ', xsLockID.toString(), err)
      return ZERO
    }
  }

  const getStakedBalance = async (account: string) => {
    if (!xsLocker) return '0'
    try {
      const stakedBalance = await withBackoffRetries(async () => xsLocker.stakedBalance(account))
      const formattedStakedBalance = formatUnits(stakedBalance, SOLACE_TOKEN.constants.decimals)
      return formattedStakedBalance
    } catch (err) {
      console.log('error getStakedBalance ', err)
      return '0'
    }
  }

  const createLock = async (recipient: string, amount: BigNumber, end: BigNumber) => {
    if (!xsLocker || !solace) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(recipient, chainId, library, xsLocker.address, solace, amount)
    const estGas = await xsLocker.estimateGas.createLockSigned(amount, end, DEADLINE, v, r, s)
    console.log('xsLocker.estimateGas.createLockSigned', estGas.toString())
    const tx = await xsLocker.createLockSigned(amount, end, DEADLINE, v, r, s, {
      ...gasConfig,
      // gasLimit: FunctionGasLimits['xsLocker.createLockSigned'],
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.CREATE_LOCK,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const increaseLockAmount = async (recipient: string, xsLockID: BigNumber, amount: BigNumber) => {
    if (!xsLocker || !solace) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(recipient, chainId, library, xsLocker.address, solace, amount)
    const estGas = await xsLocker.estimateGas.increaseAmountSigned(xsLockID, amount, DEADLINE, v, r, s)
    console.log('xsLocker.estimateGas.increaseAmountSigned', estGas.toString())
    const tx = await xsLocker.increaseAmountSigned(xsLockID, amount, DEADLINE, v, r, s, {
      ...gasConfig,
      // gasLimit: FunctionGasLimits['xsLocker.increaseAmountSigned'],
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.INCREASE_LOCK_AMOUNT,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const extendLock = async (xsLockID: BigNumber, end: BigNumber) => {
    if (!xsLocker || !solace) return { tx: null, localTx: null }
    const estGas = await xsLocker.estimateGas.extendLock(xsLockID, end)
    console.log('xsLocker.estimateGas.extendLock', estGas.toString())
    const tx = await xsLocker.extendLock(xsLockID, end, {
      ...gasConfig,
      // gasLimit: FunctionGasLimits['xsLocker.extendLock'],
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.EXTEND_LOCK,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawFromLock = async (recipient: string, xsLockIDs: BigNumber[], amount?: BigNumber) => {
    if (!xsLocker || !solace || xsLockIDs.length == 0) return { tx: null, localTx: null }
    let tx = null
    let type = FunctionName.WITHDRAW_IN_PART_FROM_LOCK
    if (amount) {
      const estGas = await xsLocker.estimateGas.withdrawInPart(xsLockIDs[0], recipient, amount)
      console.log('xsLocker.estimateGas.withdrawInPart', estGas.toString())
      tx = await xsLocker.withdrawInPart(xsLockIDs[0], recipient, amount, {
        ...gasConfig,
        // gasLimit: FunctionGasLimits['xsLocker.withdrawInPart'],
        gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      })
    } else if (xsLockIDs.length > 1) {
      const estGas = await xsLocker.estimateGas.withdrawMany(xsLockIDs, recipient)
      console.log('xsLocker.estimateGas.withdrawMany', estGas.toString())
      tx = await xsLocker.withdrawMany(xsLockIDs, recipient, {
        ...gasConfig,
        // gasLimit: FunctionGasLimits['xsLocker.withdrawMany'],
        gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
      })
      type = FunctionName.WITHDRAW_MANY_FROM_LOCK
    } else {
      const estGas = await xsLocker.estimateGas.withdraw(xsLockIDs[0], recipient)
      console.log('xsLocker.estimateGas.withdraw', estGas.toString())
      tx = await xsLocker.withdraw(xsLockIDs[0], recipient, {
        ...gasConfig,
        // gasLimit: FunctionGasLimits['xsLocker.withdraw'],
        gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
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
    const lock = new Lock(chainId, library)
    const userLockerBalances = await lock.getUserLockerBalances(account)
    return userLockerBalances
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
  const { chainId } = useNetwork()
  const { library } = useWallet()

  const getUserLocks = async (user: string): Promise<UserLocksData> => {
    const lock = new Lock(chainId, library)
    const userLocks = await lock.getUserLocks(user)
    return userLocks
  }

  return { getUserLocks }
}
