import { formatEther } from '@ethersproject/units'
import { useContracts } from '../context/ContractsManager'
import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'

export const useCapitalPoolSize = (): string => {
  const { vault, registry } = useContracts()
  const { version, dataVersion } = useWallet()
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
  }, [vault, registry, version, dataVersion])

  return capitalPoolSize
}

export const useScpBalance = (): string => {
  const { vault } = useContracts()
  const { account, version, chainId } = useWallet()
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
  }, [account, vault, version, chainId])

  return scpBalance
}
