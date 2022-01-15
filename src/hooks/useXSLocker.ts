import { useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'
import { useReadToken } from './useToken'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { GasConfiguration, LocalTx } from '../constants/types'
import { getPermitErc20Signature } from '../utils/signature'
import { DEADLINE, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { useProvider } from '../context/ProviderManager'
import { rangeFrom0 } from '../utils/numeric'
import { FunctionGasLimits } from '../constants/mappings/gasMapping'

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

  const createLock = async (
    recipient: string,
    amount: BigNumber,
    end: BigNumber,
    txVal: string,
    gasConfig: GasConfiguration
  ) => {
    if (!xsLocker || !solace) return
    const { v, r, s } = await getPermitErc20Signature(recipient, chainId, library, xsLocker.address, solace, amount)
    const tx = await xsLocker.createLockSigned(recipient, amount, end, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xsLocker.createLockSigned'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.CREATE_LOCK,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const increaseLockAmount = async (
    recipient: string,
    xsLockID: BigNumber,
    amount: BigNumber,
    end: BigNumber,
    txVal: string,
    gasConfig: GasConfiguration
  ) => {
    if (!xsLocker || !solace) return
    const { v, r, s } = await getPermitErc20Signature(recipient, chainId, library, xsLocker.address, solace, amount)
    const tx = await xsLocker.increaseAmountSigned(recipient, xsLockID, amount, end, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xsLocker.increaseAmountSigned'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.INCREASE_LOCK_AMOUNT,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const extendLock = async (xsLockID: BigNumber, end: BigNumber, txVal: string, gasConfig: GasConfiguration) => {
    if (!xsLocker || !solace) return
    const tx = await xsLocker.extendLock(xsLockID, end, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xsLocker.extendLock'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.EXTEND_LOCK,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawFromLock = async (
    recipient: string,
    xsLockIDs: BigNumber[],
    txVal: string,
    gasConfig: GasConfiguration,
    amount?: BigNumber
  ) => {
    if (!xsLocker || !solace || xsLockIDs.length == 0) return
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
      value: txVal,
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
