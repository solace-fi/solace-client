import { formatUnits, parseUnits } from '@ethersproject/units'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect, useRef } from 'react'
import { useWallet } from '../context/WalletManager'
import { floatUnits } from '../utils/formatting'
import { GAS_LIMIT, ZERO } from '../constants'
import { useCachedData } from '../context/CachedDataManager'
import { useScpBalance } from './useBalance'
import { useNetwork } from '../context/NetworkManager'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { LocalTx } from '../constants/types'
import { BigNumber } from 'ethers'

export const useCapitalPoolSize = (): string => {
  const { vault } = useContracts()
  const { currencyDecimals } = useNetwork()
  const { latestBlock } = useCachedData()
  const [capitalPoolSize, setCapitalPoolSize] = useState<string>('0')

  useEffect(() => {
    const getCapitalPoolSize = async () => {
      if (!vault) return
      try {
        const size = await vault.totalAssets()
        const formattedSize = formatUnits(size, currencyDecimals)
        setCapitalPoolSize(formattedSize)
      } catch (err) {
        console.log('useCapitalPoolSize', err)
      }
    }
    getCapitalPoolSize()
  }, [vault, latestBlock, currencyDecimals])

  return capitalPoolSize
}

export const useUserVaultDetails = () => {
  const [userVaultAssets, setUserVaultAssets] = useState<string>('0')
  const [userVaultShare, setUserVaultShare] = useState<string>('0')
  const scpBalance = useScpBalance()
  const { account } = useWallet()
  const { vault, cpFarm } = useContracts()
  const { currencyDecimals } = useNetwork()

  useEffect(() => {
    const getUserVaultDetails = async () => {
      if (!vault || !account) return
      try {
        const totalSupply = await vault.totalSupply()
        const userStaked = cpFarm ? await cpFarm.userStaked(account) : ZERO
        const cpBalance = parseUnits(scpBalance, currencyDecimals)
        const userAssets = cpBalance.add(userStaked)
        const userShare = totalSupply.gt(ZERO)
          ? floatUnits(userAssets.mul(100), currencyDecimals) / floatUnits(totalSupply, currencyDecimals)
          : 0
        const formattedUserAssets = formatUnits(userAssets, currencyDecimals)
        setUserVaultAssets(formattedUserAssets)
        setUserVaultShare(userShare.toString())
      } catch (err) {
        console.log('error getUserVaultShare ', err)
      }
    }
    getUserVaultDetails()
  }, [vault, cpFarm, scpBalance, account])

  return { userVaultAssets, userVaultShare }
}

export const useCooldown = () => {
  const { vault } = useContracts()
  const { account } = useWallet()
  const [cooldownStarted, setCooldownStarted] = useState<boolean>(false)
  const [timeWaited, setTimeWaited] = useState<number>(0)
  const [canWithdrawEth, setCanWithdrawEth] = useState<boolean>(false)
  const [cooldownMin, setCooldownMin] = useState<number>(0)
  const [cooldownMax, setCooldownMax] = useState<number>(0)
  const [cooldownStart, setCooldownStart] = useState<number>(0)
  const { version } = useCachedData()
  const gettingCooldown = useRef(true)

  const startCooldown = async (): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!vault) return { tx: null, localTx: null }
    const tx = await vault.startCooldown()
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.START_COOLDOWN,
      value: 'Starting Withdrawal Cooldown',
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const stopCooldown = async (): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!vault) return { tx: null, localTx: null }
    const tx = await vault.stopCooldown()
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.STOP_COOLDOWN,
      value: 'Stopping Withdrawal Cooldown',
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  useEffect(() => {
    const getCooldown = async () => {
      if (!vault || !account) return
      try {
        gettingCooldown.current = true
        const _cooldownMin: number = await vault.cooldownMin()
        const _cooldownMax: number = await vault.cooldownMax()
        const _cooldownStart: number = await vault.cooldownStart(account)
        setCooldownMin(_cooldownMin * 1000)
        setCooldownMax(_cooldownMax * 1000)
        setCooldownStart(_cooldownStart * 1000)
        gettingCooldown.current = false
      } catch (err) {
        console.log('error getCooldown ', err)
      }
    }
    getCooldown()
  }, [vault, account, version])

  useEffect(() => {
    const calculateTime = () => {
      const _timeWaited = Date.now() - cooldownStart
      setTimeWaited(_timeWaited)
      if (cooldownStart > 0) {
        setCanWithdrawEth(cooldownMin <= _timeWaited && _timeWaited <= cooldownMax)
        setCooldownStarted(true)
      } else {
        setCooldownStarted(false)
      }
    }
    if (gettingCooldown.current) return
    calculateTime()
  }, [cooldownStart])

  return {
    cooldownStarted,
    timeWaited,
    cooldownMin,
    cooldownMax,
    canWithdrawEth,
    startCooldown,
    stopCooldown,
  }
}

export const useVault = () => {
  const { vault } = useContracts()

  const depositEth = async (
    parsedAmount: BigNumber,
    txVal: string,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!vault) return { tx: null, localTx: null }
    const tx = await vault.depositEth({
      value: parsedAmount,
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_ETH,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawEth = async (
    parsedAmount: BigNumber,
    txVal: string,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!vault) return { tx: null, localTx: null }
    const tx = await vault.withdrawEth(parsedAmount, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_ETH,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return {
    depositEth,
    withdrawEth,
  }
}
