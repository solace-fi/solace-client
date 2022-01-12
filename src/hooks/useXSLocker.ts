import { useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'
import { useReadToken } from './useToken'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { GasConfiguration, LocalTx } from '../constants/types'
import { getPermitErc20Signature } from '../utils/signature'
import { DEADLINE, GAS_LIMIT, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'

export const useXSLocker = () => {
  const { keyContracts } = useContracts()
  const { xsLocker, solace } = useMemo(() => keyContracts, [keyContracts])
  const { library } = useWallet()
  const { chainId } = useNetwork()
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

  const getLockedBalance = async (account: string) => {
    if (!xsLocker) return '0'
    try {
      const stakedBalance = await xsLocker.stakedBalance(account)
      const formattedStakedBalance = formatUnits(stakedBalance, readToken.decimals)
      return formattedStakedBalance
    } catch (err) {
      console.log('error getLockedBalance ', err)
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
      gasLimit: GAS_LIMIT,
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
      gasLimit: GAS_LIMIT,
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
      gasLimit: GAS_LIMIT,
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
    const gasSettings = {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    }
    if (amount) {
      tx = await xsLocker.withdrawInPart(xsLockIDs[0], recipient, amount, gasSettings)
    } else if (xsLockIDs.length > 1) {
      tx = await xsLocker.withdrawMany(xsLockIDs, recipient, gasSettings)
    } else {
      tx = await xsLocker.withdraw(xsLockIDs[0], recipient, gasSettings)
    }

    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_FROM_LOCK,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return {
    createLock,
    increaseLockAmount,
    extendLock,
    withdrawFromLock,
    getLockedBalance,
    getLock,
    getIsLocked,
    getTimeLeft,
  }
}
