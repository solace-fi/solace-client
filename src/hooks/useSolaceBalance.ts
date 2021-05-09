import { formatEther } from '@ethersproject/units'
import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/Web3Manager'

export const useSolaceBalance = () => {
  const [solaceBalance, setSolaceBalance] = useState<string>('0.00')

  const { solace } = useContracts()
  const wallet = useWallet()

  useEffect(() => {
    const getSolaceBalance = async () => {
      if (!solace) return
      const balance = await solace.balanceOf(wallet.account)
      const formattedBalance = formatEther(balance)
      // console.log(formattedBalance)
      setSolaceBalance(balance)
    }
    getSolaceBalance()
  }, [solace, wallet])

  return solaceBalance
}
