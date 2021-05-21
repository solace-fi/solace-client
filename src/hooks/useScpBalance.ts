import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { formatEther } from '@ethersproject/units'

export const useScpBalance = () => {
  const { vault } = useContracts()
  const wallet = useWallet()
  const [scpBalance, setScpBalance] = useState<string>('0.00')

  useEffect(() => {
    const getScpBalance = async () => {
      if (!vault) return
      try {
        const balance = await vault.balanceOf(wallet.account)
        const formattedBalance = formatEther(balance)
        setScpBalance(formattedBalance)
      } catch (err) {
        console.log('getScpBalance', err)
      }
    }
    getScpBalance()
  }, [wallet, vault])

  return scpBalance
}
