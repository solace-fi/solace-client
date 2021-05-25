import { useState, useEffect } from 'react'
import { fetchEtherscanTxHistoryByAddress } from '../utils/etherscan'
import { useWallet } from '../context/WalletManager'
import { useUserData } from '../context/UserDataManager'

export const useFetchTxHistoryByAddress = () => {
  const { account, dataVersion } = useWallet()
  const { deleteLocalTransactions } = useUserData()
  const [txHistory, setTxHistory] = useState<any>([])

  useEffect(() => {
    const fetchTxHistoryByAddress = async (account: string) => {
      await fetchEtherscanTxHistoryByAddress(account).then((result) => {
        deleteLocalTransactions(result.txList)
        setTxHistory(result)
      })
    }
    account ? fetchTxHistoryByAddress(account) : setTxHistory([])
  }, [account, dataVersion])

  return txHistory
}
