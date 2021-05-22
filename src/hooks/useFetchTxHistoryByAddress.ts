import { useState, useEffect } from 'react'
import { fetchEtherscanTxHistoryByAddress } from '../utils/etherscan'
import { useWallet } from '../context/WalletManager'

export const useFetchTxHistoryByAddress = () => {
  const { account, version } = useWallet()
  const [txHistory, setTxHistory] = useState<any>([])

  useEffect(() => {
    const fetchTxHistoryByAddress = async (account: string) => {
      await fetchEtherscanTxHistoryByAddress(account).then((result) => {
        console.log(result)
        setTxHistory(result)
      })
    }
    account ? fetchTxHistoryByAddress(account) : setTxHistory([])
  }, [account, version])

  return txHistory
}
