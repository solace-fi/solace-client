import { useState, useEffect } from 'react'
import { fetchEtherscanTxHistoryByAddress } from '../utils/etherscan'
import { useWallet } from '../context/WalletManager'
import { useUserData } from '../context/UserDataManager'
import { CHAIN_ID } from '../constants'

export const useFetchTxHistoryByAddress = (): any => {
  const { account, dataVersion, reload, chainId } = useWallet()
  const { deleteLocalTransactions } = useUserData()
  const [txHistory, setTxHistory] = useState<any>([])

  const fetchTxHistoryByAddress = async (account: string) => {
    await fetchEtherscanTxHistoryByAddress(chainId ?? Number(CHAIN_ID), account).then((result) => {
      deleteLocalTransactions(result.txList)
      setTxHistory(result)
      reload()
    })
  }

  useEffect(() => {
    account ? fetchTxHistoryByAddress(account) : setTxHistory([])
  }, [account, dataVersion, chainId])

  return txHistory
}
