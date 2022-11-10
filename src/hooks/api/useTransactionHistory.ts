import { fetchExplorerTxHistoryByAddress } from '../../utils/explorer'
import { useState, useEffect, useRef } from 'react'
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useWeb3React } from '@web3-react/core'

export const useFetchTxHistoryByAddress = (): any => {
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { deleteLocalTransactions } = useCachedData()
  const { latestBlock } = useProvider()
  const [txHistory, setTxHistory] = useState<any>([])
  const { contractSources } = useContracts()
  const running = useRef(false)

  const fetchTxHistoryByAddress = async (account: string) => {
    running.current = true
    try {
      await fetchExplorerTxHistoryByAddress(activeNetwork, account)
        .then((result) => {
          if (result.status == '1') {
            const contractAddrs = contractSources.map((contract) => contract.addr)
            const txList: any[] = result.result.filter((tx: any) => contractAddrs.includes(tx.to.toLowerCase()))
            deleteLocalTransactions(txList)
            setTxHistory(txList.slice(0, 30))
          } else {
            setTxHistory([])
          }
        })
        .catch((err) => console.log('useFetchTxHistoryByAddress', err))
    } catch (err) {
      console.log('useFetchTxHistoryByAddress try block', err)
    }
    running.current = false
  }

  useEffect(() => {
    if (!latestBlock || !account || running.current) return
    fetchTxHistoryByAddress(account)
  }, [latestBlock, account])

  return txHistory
}
