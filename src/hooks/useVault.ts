import { formatEther, parseEther } from '@ethersproject/units'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { floatEther } from '../utils/formatting'
import { ZERO } from '../constants'
import { useCachedData } from '../context/CachedDataManager'

export const useCapitalPoolSize = (): string => {
  const { vault, registry } = useContracts()
  const { version, latestBlock } = useCachedData()
  const [capitalPoolSize, setCapitalPoolSize] = useState<string>('0.00')

  useEffect(() => {
    const getCapitalPoolSize = async () => {
      if (!registry || !vault) return
      try {
        const size = await vault.totalAssets()
        const formattedSize = formatEther(size)
        setCapitalPoolSize(formattedSize)
      } catch (err) {
        console.log('useCapitalPoolSize', err)
      }
    }
    getCapitalPoolSize()
  }, [vault, registry, version, latestBlock])

  return capitalPoolSize
}

export const useScpBalance = (): string => {
  const { vault } = useContracts()
  const { account, chainId } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [scpBalance, setScpBalance] = useState<string>('0.00')

  useEffect(() => {
    const getScpBalance = async () => {
      if (!vault) return
      try {
        const balance = await vault.balanceOf(account)
        const formattedBalance = formatEther(balance)
        setScpBalance(formattedBalance)
      } catch (err) {
        console.log('getScpBalance', err)
      }
    }
    getScpBalance()
  }, [account, vault, version, chainId, latestBlock])

  return scpBalance
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
