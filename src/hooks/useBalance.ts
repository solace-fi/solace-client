import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useCachedData } from '../context/CachedDataManager'
import { useState, useEffect } from 'react'
import { formatEther } from '@ethersproject/units'

export const useNativeTokenBalance = (): string => {
  const { account, library, connect } = useWallet()
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
  }, [account, library, version, connect])

  return balance
}

export const useScpBalance = (): string => {
  const { vault } = useContracts()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
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
  }, [account, vault, version, latestBlock])

  return scpBalance
}

export const useSolaceBalance = (): string => {
  const { solace } = useContracts()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
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
  }, [solace, account, version, latestBlock])

  return solaceBalance
}

export const useLpBalance = (): string => {
  const { lpToken } = useContracts()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [lpBalance, setLpBalance] = useState<string>('0.00')

  useEffect(() => {
    const getLpBalance = async () => {
      if (!lpToken) return
      try {
        const balance = await lpToken.balanceOf(account)
        const formattedBalance = formatEther(balance)
        setLpBalance(formattedBalance)
      } catch (err) {
        console.log('getLpBalance', err)
      }
    }
    getLpBalance()
  }, [lpToken, account, version, latestBlock])

  return lpBalance
}
