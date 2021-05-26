import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { formatEther } from '@ethersproject/units'

export const useEthBalance = (): string => {
  const { account, library, version, chainId } = useWallet()
  const [balance, setBalance] = useState<string>('0.00')

  useEffect(() => {
    const getEthBalance = async () => {
      if (!library || !account) return
      try {
        const balance = await library.getBalance(account)
        const formattedBalance = formatEther(balance)
        setBalance(formattedBalance)
      } catch (err) {
        console.log('getEthbalance', err)
      }
    }
    getEthBalance()
  }, [account, library, version, chainId])

  return balance
}
