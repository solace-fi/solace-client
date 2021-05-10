import { formatEther } from '@ethersproject/units'
import { useState, useEffect } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/Web3Manager'

export const useSolaceBalance = () => {
  const { solace } = useContracts()
  const wallet = useWallet()
  const [solaceBalance, setSolaceBalance] = useState<string>('0.00')

  useEffect(() => {
    const getSolaceBalance = async () => {
      if (!solace) return
      try {
        const balance = await solace.balanceOf(wallet.account)
        const formattedBalance = formatEther(balance)
        // console.log(formattedBalance)
        setSolaceBalance(formattedBalance)
      } catch (err) {
        console.log('getSolaceBalance', err)
      }
    }
    getSolaceBalance()
  }, [solace, wallet])

  return solaceBalance
}
