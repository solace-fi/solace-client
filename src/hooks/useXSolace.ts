import { useState, useEffect, useCallback, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useWallet } from '../context/WalletManager'
import { GasConfiguration, LocalTx } from '../constants/types'
import { BigNumber } from 'ethers'
import { DEADLINE, GAS_LIMIT, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { getPermitErc20Signature } from '../utils/signature'
import { useXSolaceBalance } from './useBalance'
import { floatUnits } from '../utils/formatting'
import { useCachedData } from '../context/CachedDataManager'
import { useProvider } from '../context/ProviderManager'
import { useReadToken } from './useToken'

// TODO: populate with depositAndLockSigned
export const useXSolace = () => {
  const { keyContracts } = useContracts()
  const { solace, xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { account, library } = useWallet()
  const { chainId } = useNetwork()

  const stake = async (parsedAmount: BigNumber, txVal: string, gasConfig: GasConfiguration) => {
    if (!solace || !xSolace || !account) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(account, chainId, library, xSolace.address, solace, parsedAmount)
    const tx = await xSolace.depositSigned(account, parsedAmount, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.STAKE,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const unstake = async (parsedAmount: BigNumber, txVal: string, gasConfig: GasConfiguration) => {
    if (!xSolace || !account) return { tx: null, localTx: null }
    const tx = await xSolace.withdraw(parsedAmount, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.UNSTAKE,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const lock = async (duration: number, txVal: string, gasConfig: GasConfiguration) => {
    if (!xSolace || !account) return { tx: null, localTx: null }
    const tx = await xSolace.lock(duration, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.LOCK,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { stake, unstake, lock }
}

export const useXSolaceDetails = () => {
  const { keyContracts } = useContracts()
  const { xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { version } = useCachedData()
  const { latestBlock } = useProvider()

  const [totalSolaceDeposited, setTotalSolaceDeposited] = useState<BigNumber>(ZERO)
  const [totalSolaceLocked, setTotalSolaceLocked] = useState<BigNumber>(ZERO)
  const [totalSolaceUnlocked, setTotalSolaceUnlocked] = useState<BigNumber>(ZERO)

  const getTotalSolaceDeposited = useCallback(async () => {
    if (!xSolace) return
    try {
      const totalSolaceDeposited = await xSolace.totalSolaceDeposited()
      setTotalSolaceDeposited(totalSolaceDeposited)
    } catch (err) {
      console.log('error getTotalSolaceDeposited ', err)
    }
  }, [xSolace])

  const getTotalSolaceLocked = useCallback(async () => {
    if (!xSolace) return
    try {
      const totalSolaceLocked = await xSolace.totalSolaceLocked()
      setTotalSolaceLocked(totalSolaceLocked)
    } catch (err) {
      console.log('error getTotalSolaceLocked ', err)
    }
  }, [xSolace])

  const getTotalSolaceUnlocked = useCallback(async () => {
    if (!xSolace) return
    try {
      const totalSolaceUnlocked = await xSolace.totalSolaceUnlocked()
      setTotalSolaceUnlocked(totalSolaceUnlocked)
    } catch (err) {
      console.log('error getTotalSolaceUnlocked ', err)
    }
  }, [xSolace])

  useEffect(() => {
    getTotalSolaceDeposited()
    getTotalSolaceLocked()
    getTotalSolaceUnlocked()
  }, [latestBlock, version, getTotalSolaceDeposited, getTotalSolaceLocked, getTotalSolaceUnlocked])

  return { totalSolaceDeposited, totalSolaceLocked, totalSolaceUnlocked }
}

export const useXSolaceByAccount = () => {
  const { keyContracts } = useContracts()
  const { xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWallet()
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const xSolaceBalance = useXSolaceBalance()
  const readXSolaceToken = useReadToken(xSolace)
  const [userShare, setUserShare] = useState<string>('0')
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [lockedTimeLeft, setLockedTimeLeft] = useState<boolean>(false)
  const [stakedBalance, setStakedBalance] = useState<BigNumber>(ZERO)

  const getXSolaceUserPoolShare = useCallback(async () => {
    if (!xSolace || xSolaceBalance == '0') return
    try {
      const totalSupply = await xSolace.totalSupply()
      const userShare = totalSupply.gt(ZERO)
        ? parseFloat(xSolaceBalance) / floatUnits(totalSupply, readXSolaceToken.decimals)
        : 0
      setUserShare(userShare.toString())
    } catch (err) {
      console.log('error getXSolaceUserPoolShare ', err)
    }
  }, [xSolace, xSolaceBalance, readXSolaceToken])

  const getIsLocked = useCallback(async () => {
    if (!xSolace || !account) return
    try {
      const isLocked = await xSolace.isLocked(account)
      setIsLocked(isLocked)
    } catch (err) {
      console.log('error getIsLocked ', err)
    }
  }, [account, xSolace])

  const getLockedTimeLeft = useCallback(async () => {
    if (!xSolace || !account) return
    try {
      const lockedTimeLeft = await xSolace.lockedTimeLeft(account)
      setLockedTimeLeft(lockedTimeLeft)
    } catch (err) {
      console.log('error getIsLocked ', err)
    }
  }, [account, xSolace])

  const getLockedSolaceForUser = useCallback(async () => {
    if (!xSolace || !account) return
    try {
      const userValue = await xSolace.userInfo(account)
      const pendingRewards = await xSolace.pendingRewards(account)
      const stakedBalance = userValue.value.add(pendingRewards)
      setStakedBalance(stakedBalance)
    } catch (err) {
      console.log('error stakedBalance ', err)
    }
  }, [account, xSolace])

  useEffect(() => {
    getIsLocked()
    getLockedTimeLeft()
    getXSolaceUserPoolShare()
    getLockedSolaceForUser()
  }, [latestBlock, version, getIsLocked, getLockedTimeLeft, getXSolaceUserPoolShare, getLockedSolaceForUser])

  return { userShare, stakedBalance, isLocked, lockedTimeLeft }
}
