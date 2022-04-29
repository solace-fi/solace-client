import { useState, useEffect, useRef, useMemo } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { useContracts } from '../../context/ContractsManager'
import { floatUnits } from '../../utils/formatting'
import { ZERO } from '../../constants'
import { useCachedData } from '../../context/CachedDataManager'
import { useScpBalance } from '../balance/useBalance'
import { useNetwork } from '../../context/NetworkManager'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, TxResult } from '../../constants/types'
import { BigNumber } from 'ethers'
import { FunctionGasLimits } from '../../constants/mappings/gas'
import { useProvider } from '../../context/ProviderManager'
import { useGetFunctionGas } from '../provider/useGas'
import { useWeb3React } from '@web3-react/core'

export const useCapitalPoolSize = (): string => {
  const { keyContracts } = useContracts()
  const { vault } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork } = useNetwork()
  const { latestBlock } = useProvider()
  const [capitalPoolSize, setCapitalPoolSize] = useState<string>('0')

  useEffect(() => {
    const getCapitalPoolSize = async () => {
      if (!vault) return
      try {
        const size = await vault.totalAssets()
        const formattedSize = formatUnits(size, activeNetwork.nativeCurrency.decimals)
        setCapitalPoolSize(formattedSize)
      } catch (err) {
        console.log('useCapitalPoolSize', err)
      }
    }
    getCapitalPoolSize()
  }, [vault, latestBlock, activeNetwork.nativeCurrency.decimals])

  return capitalPoolSize
}

export const useUserVaultDetails = () => {
  const [userVaultAssets, setUserVaultAssets] = useState<string>('0')
  const [userVaultShare, setUserVaultShare] = useState<string>('0')
  const scpBalance = useScpBalance()
  const { account } = useWeb3React()
  const { keyContracts } = useContracts()
  const { vault, cpFarm } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork } = useNetwork()

  useEffect(() => {
    const getUserVaultShare = async () => {
      if (!vault || !account) return
      try {
        const totalSupply = await vault.totalSupply()
        const userStaked = cpFarm ? await cpFarm.userStaked(account) : ZERO
        const cpBalance = parseUnits(scpBalance, activeNetwork.nativeCurrency.decimals)
        const userAssets = cpBalance.add(userStaked)
        const userShare = totalSupply.gt(ZERO)
          ? floatUnits(userAssets.mul(100), activeNetwork.nativeCurrency.decimals) /
            floatUnits(totalSupply, activeNetwork.nativeCurrency.decimals)
          : 0
        const formattedUserAssets = formatUnits(userAssets, activeNetwork.nativeCurrency.decimals)
        setUserVaultAssets(formattedUserAssets)
        setUserVaultShare(userShare.toString())
      } catch (err) {
        console.log('error getUserVaultShare ', err)
      }
    }
    getUserVaultShare()
  }, [vault, cpFarm, scpBalance, account])

  return { userVaultAssets, userVaultShare }
}

export const useCooldown = () => {
  const { keyContracts } = useContracts()
  const { vault } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWeb3React()
  const [cooldownStarted, setCooldownStarted] = useState<boolean>(false)
  const [timeWaited, setTimeWaited] = useState<number>(0)
  const [canWithdrawEth, setCanWithdrawEth] = useState<boolean>(false)
  const [cooldownMin, setCooldownMin] = useState<number>(0)
  const [cooldownMax, setCooldownMax] = useState<number>(0)
  const [cooldownStart, setCooldownStart] = useState<number>(0)
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const gettingCooldown = useRef(true)

  const startCooldown = async (): Promise<TxResult> => {
    if (!vault) return { tx: null, localTx: null }
    const tx = await vault.startCooldown()
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.START_COOLDOWN,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const stopCooldown = async (): Promise<TxResult> => {
    if (!vault) return { tx: null, localTx: null }
    const tx = await vault.stopCooldown()
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.STOP_COOLDOWN,
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
        gettingCooldown.current = false
        setCooldownMin(_cooldownMin * 1000)
        setCooldownMax(_cooldownMax * 1000)
        setCooldownStart(_cooldownStart * 1000)
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
  }, [cooldownStart, latestBlock])

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
  const { keyContracts } = useContracts()
  const { vault } = useMemo(() => keyContracts, [keyContracts])
  const { version } = useCachedData()
  const { account } = useWeb3React()
  const [canTransfer, setCanTransfer] = useState<boolean>(true)
  const { gasConfig } = useGetFunctionGas()

  const depositEth = async (parsedAmount: BigNumber): Promise<TxResult> => {
    if (!vault) return { tx: null, localTx: null }
    const tx = await vault.depositEth({
      value: parsedAmount,
      ...gasConfig,
      gasLimit: FunctionGasLimits['vault.depositEth'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_ETH,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawEth = async (parsedAmount: BigNumber): Promise<TxResult> => {
    if (!vault) return { tx: null, localTx: null }
    const estGas = await vault.estimateGas.withdrawEth(parsedAmount)
    console.log('vault.estimateGas.withdrawEth', estGas.toString())
    const tx = await vault.withdrawEth(parsedAmount, {
      ...gasConfig,
      // gasLimit: FunctionGasLimits['vault.withdrawEth'],
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_ETH,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  useEffect(() => {
    const canTransfer = async () => {
      if (!vault || !account) return
      const canTransfer = await vault.canTransfer(account)
      setCanTransfer(canTransfer)
    }
    canTransfer()
  }, [vault, account, version])

  return {
    canTransfer,
    depositEth,
    withdrawEth,
    vault,
  }
}
