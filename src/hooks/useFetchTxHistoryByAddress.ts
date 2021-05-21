import { useState, useEffect } from 'react'
import { fetchEtherscanTxHistoryByAddress } from '../utils/etherscan'
import { useWallet } from '../context/WalletManager'

export const useFetchTxHistoryByAddress = () => {
  const wallet = useWallet()
  const [txHistory, setTxHistory] = useState<any>([])

  useEffect(() => {
    const fetchTxHistoryByAddress = async (account: string) => {
      await fetchEtherscanTxHistoryByAddress(account).then((result) => {
        console.log('etherscan history', result)
        setTxHistory(result)
      })
    }
    wallet.account ? fetchTxHistoryByAddress(wallet.account) : setTxHistory([])
  }, [wallet])

  return txHistory
}
