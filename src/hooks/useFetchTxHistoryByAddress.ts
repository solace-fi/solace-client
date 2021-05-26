import { useState, useEffect } from 'react'
import { fetchEtherscanTxHistoryByAddress } from '../utils/etherscan'
import { useWallet } from '../context/WalletManager'
import { useUserData } from '../context/UserDataManager'
import { CHAIN_ID } from '../constants'

export const useFetchTxHistoryByAddress = () => {
  const { account, dataVersion, chainId } = useWallet()
  const { deleteLocalTransactions } = useUserData()
  const [txHistory, setTxHistory] = useState<any>([])

  useEffect(() => {
    const fetchTxHistoryByAddress = async (account: string) => {
      await fetchEtherscanTxHistoryByAddress(chainId ?? Number(CHAIN_ID), account).then((result) => {
        deleteLocalTransactions(result.txList)
        setTxHistory(result)
      })
    }
    account ? fetchTxHistoryByAddress(account) : setTxHistory([])
  }, [account, dataVersion])

  return txHistory
}
