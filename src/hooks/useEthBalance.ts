import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { formatEther } from '@ethersproject/units'

export const useEthBalance = () => {
  const wallet = useWallet()
  const [balance, setBalance] = useState<string>('0.00')

  useEffect(() => {
    const getEthBalance = async () => {
      if (!wallet.library || !wallet.account) return
      try {
        const balance = await wallet.library.getBalance(wallet.account)
        const formattedBalance = formatEther(balance)
        setBalance(formattedBalance)
      } catch (err) {
        console.log('getEthbalance', err)
      }
    }
    getEthBalance()
  }, [wallet])

  return balance
}
