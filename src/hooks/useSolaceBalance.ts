import { formatEther } from '@ethersproject/units'
import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'

export const useSolaceBalance = (): string => {
  const { solace } = useContracts()
  const { account, version } = useWallet()
  const [solaceBalance, setSolaceBalance] = useState<string>('0.00')

  useEffect(() => {
    const getSolaceBalance = async () => {
      if (!solace) return
      try {
        const balance = await solace.balanceOf(account)
        const formattedBalance = formatEther(balance)
        setSolaceBalance(formattedBalance)
      } catch (err) {
        console.log('getSolaceBalance', err)
      }
    }
    getSolaceBalance()
  }, [solace, account, version])

  return solaceBalance
}
