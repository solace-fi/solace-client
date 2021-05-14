import { useState, useEffect, useCallback } from 'react'
// import { useWeb3React } from '@web3-react/core'
import { useWallet } from '../context/Web3Manager'
import { formatEther } from '@ethersproject/units'
import { ZERO } from '../constants'
import { useContracts } from '../context/ContractsManager'

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
  }, [wallet]) // ensures refresh if referential identity of library doesn't change across chainIds

  return balance
}
