import { useState, useEffect, useCallback } from 'react'
// import { useWeb3React } from '@web3-react/core'
import { useWallet } from '../context/Web3Manager'
import { formatEther } from '@ethersproject/units'
import { ZERO } from '../constants'
import { useContracts } from '../context/ContractsManager'

export const useEthBalance = () => {
  const { master, vault, cpFarm } = useContracts()
  const wallet = useWallet()
  const [balance, setBalance] = useState<any>('0.00')

  useEffect(() => {
    console.log('changing eth balance')
    if (!!wallet.library && !!wallet.account) {
      wallet.library
        .getBalance(wallet.account)
        .then((balance: number) => {
          setBalance(formatEther(balance))
        })
        .catch(() => {
          setBalance(formatEther(ZERO))
        })
    }
  }, [wallet, master, vault, cpFarm]) // ensures refresh if referential identity of library doesn't change across chainIds

  return balance
}
