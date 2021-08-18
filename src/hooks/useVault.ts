import { formatUnits, parseUnits } from '@ethersproject/units'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { floatUnits } from '../utils/formatting'
import { ZERO } from '../constants'
import { useCachedData } from '../context/CachedDataManager'
import { useScpBalance } from './useBalance'
import { useNetwork } from '../context/NetworkManager'

export const useCapitalPoolSize = (): string => {
  const { vault } = useContracts()
  const { currencyDecimals } = useNetwork()
  const { version, latestBlock } = useCachedData()
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
  }, [vault, version, latestBlock, currencyDecimals])

  return capitalPoolSize
}

export const useUserVaultDetails = () => {
  const [userVaultAssets, setUserVaultAssets] = useState<string>('0')
  const [userVaultShare, setUserVaultShare] = useState<string>('0')
  const scpBalance = useScpBalance()
  const { library, account } = useWallet()
  const { vault, cpFarm } = useContracts()
  const { version } = useCachedData()
  const { activeNetwork, currencyDecimals } = useNetwork()

  useEffect(() => {
    const getUserVaultDetails = async () => {
      if (!vault || !account) return
      try {
        const totalSupply = await vault.totalSupply()
        const userInfo = cpFarm ? await cpFarm.userInfo(account) : { value: ZERO }
        const value = userInfo.value
        const cpBalance = parseUnits(scpBalance, currencyDecimals)
        const userAssets = cpBalance.add(value)
        const userShare = totalSupply.gt(ZERO)
          ? floatUnits(userAssets.mul(100), currencyDecimals) / floatUnits(totalSupply, currencyDecimals)
          : 0
        const formattedAssets = formatUnits(userAssets, currencyDecimals)
        setUserVaultAssets(formattedAssets)
        setUserVaultShare(userShare.toString())
      } catch (err) {
        console.log('error getUserVaultShare ', err)
      }
    }
    getUserVaultDetails()
  }, [library, scpBalance, cpFarm, account, vault, version, activeNetwork])

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
  const { latestBlock } = useCachedData()

  useEffect(() => {
    const getCooldown = async () => {
      if (!vault || !account) return
      try {
        const _cooldownStart: number = await vault.cooldownStart(account)
        const _cooldownMin: number = await vault.cooldownMin()
        const _cooldownMax: number = await vault.cooldownMax()
        const _timeWaited = Date.now() - _cooldownStart * 1000
        setCooldownMin(_cooldownMin * 1000)
        setCooldownMax(_cooldownMax * 1000)
        setTimeWaited(_timeWaited)
        if (_cooldownStart > 0) {
          setCanWithdrawEth(_cooldownMin * 1000 <= _timeWaited && _timeWaited <= _cooldownMax * 1000)
          setCooldownStarted(true)
        } else {
          setCooldownStarted(false)
        }
      } catch (err) {
        console.log('error getCooldown ', err)
      }
    }
    getCooldown()
  }, [vault, account, latestBlock])

  return { cooldownStarted, timeWaited, cooldownMin, cooldownMax, canWithdrawEth }
}
