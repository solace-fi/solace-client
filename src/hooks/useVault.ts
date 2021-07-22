import { formatEther, parseEther } from '@ethersproject/units'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { floatEther } from '../utils/formatting'
import { ZERO } from '../constants'
import { useCachedData } from '../context/CachedDataManager'
import { useScpBalance } from './useBalance'

export const useCapitalPoolSize = (): string => {
  const { vault } = useContracts()
  const { version, latestBlock } = useCachedData()
  const [capitalPoolSize, setCapitalPoolSize] = useState<string>('0.00')

  useEffect(() => {
    const getCapitalPoolSize = async () => {
      if (!vault) return
      try {
        const size = await vault.totalAssets()
        const formattedSize = formatEther(size)
        setCapitalPoolSize(formattedSize)
      } catch (err) {
        console.log('useCapitalPoolSize', err)
      }
    }
    getCapitalPoolSize()
  }, [vault, version, latestBlock])

  return capitalPoolSize
}

export const useUserVaultDetails = () => {
  const [userVaultAssets, setUserVaultAssets] = useState<string>('0')
  const [userVaultShare, setUserVaultShare] = useState<string>('0')
  const scpBalance = useScpBalance()
  const { library, account } = useWallet()
  const { vault, cpFarm } = useContracts()

  useEffect(() => {
    const getUserVaultDetails = async () => {
      if (!cpFarm || !vault || !account) return
      try {
        const totalSupply = await vault.totalSupply()
        const userInfo = await cpFarm.userInfo(account)
        const value = userInfo.value
        const cpBalance = parseEther(scpBalance)
        const userAssets = cpBalance.add(value)
        const userShare = totalSupply.gt(ZERO) ? floatEther(userAssets.mul(100)) / floatEther(totalSupply) : 0
        const formattedAssets = formatEther(userAssets)
        setUserVaultAssets(formattedAssets)
        setUserVaultShare(userShare.toString())
      } catch (err) {
        console.log('error getUserVaultShare ', err)
      }
    }
    getUserVaultDetails()
  }, [library, scpBalance, cpFarm, account, vault])

  return { userVaultAssets, userVaultShare }
}
