import { useState, useEffect } from 'react'
import { fetchEtherscanTxHistoryByAddress } from '../utils/etherscan'
import { useWallet } from '../context/WalletManager'
import { useUserData } from '../context/UserDataManager'
import { DEFAULT_CHAIN_ID } from '../constants'
import { useContractArray } from './useContract'

export const useFetchTxHistoryByAddress = (): any => {
  const { account, dataVersion, reload, chainId } = useWallet()
  const { deleteLocalTransactions } = useUserData()
  const [txHistory, setTxHistory] = useState<any>([])
  const contractAddrs = useContractArray()

  const fetchTxHistoryByAddress = async (account: string) => {
    await fetchEtherscanTxHistoryByAddress(chainId ?? DEFAULT_CHAIN_ID, account, contractAddrs).then((result) => {
      deleteLocalTransactions(result.txList)
      setTxHistory(result.txList.slice(0, 30))
      reload()
    })
  }

  useEffect(() => {
    account ? fetchTxHistoryByAddress(account) : setTxHistory([])
  }, [account, dataVersion, chainId])

  return txHistory
}
