import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { formatEther } from '@ethersproject/units'

export const useScpBalance = () => {
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
