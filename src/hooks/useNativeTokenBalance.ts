import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { formatEther } from '@ethersproject/units'
import { useCachedData } from '../context/CachedDataManager'

export const useNativeTokenBalance = (): string => {
  const { account, library, chainId, connect } = useWallet()
  const { version } = useCachedData()
  const [balance, setBalance] = useState<string>('0.00')

  useEffect(() => {
    const getNativeTokenBalance = async () => {
      if (!library || !account) return
      try {
        const balance = await library.getBalance(account)
        const formattedBalance = formatEther(balance)
        setBalance(formattedBalance)
      } catch (err) {
        console.log('getNativeTokenbalance', err)
      }
    }
    getNativeTokenBalance()
  }, [account, library, version, chainId, connect])

  return balance
}
