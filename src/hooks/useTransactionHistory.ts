import { fetchExplorerTxHistoryByAddress } from '../utils/explorer'
import { useState, useEffect } from 'react'
import { useCachedData } from '../context/CachedDataManager'
import { useWallet } from '../context/WalletManager'
import { FunctionName } from '../constants/enums'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { decodeInput } from '../utils/decoder'
import { formatTransactionContent } from '../utils/formatting'
import { useContracts } from '../context/ContractsManager'
import { contractConfig } from '../config/chainConfig'
import { DEFAULT_CHAIN_ID } from '../constants'

export const useFetchTxHistoryByAddress = (): any => {
  const { account, chainId } = useWallet()
  const { deleteLocalTransactions, dataVersion } = useCachedData()
  const [txHistory, setTxHistory] = useState<any>([])
  const { contractSources } = useContracts()

  const fetchTxHistoryByAddress = async (account: string) => {
    await fetchExplorerTxHistoryByAddress(chainId ?? DEFAULT_CHAIN_ID, account, contractSources).then((result) => {
      deleteLocalTransactions(result.txList)
      setTxHistory(result.txList.slice(0, 30))
    })
  }

  useEffect(() => {
    account ? fetchTxHistoryByAddress(account) : setTxHistory([])
  }, [account, contractSources, dataVersion])

  return txHistory
}

export const useTransactionDetails = (): { txHistory: any; amounts: string[] } => {
  const { library, chainId } = useWallet()
  const [amounts, setAmounts] = useState<string[]>([])
  const { contractSources } = useContracts()
  const txHistory = useFetchTxHistoryByAddress()

  const getTransactionAmount = async (
    function_name: string,
    tx: any,
    provider: Web3Provider | Provider
  ): Promise<string> => {
    const receipt = await provider.getTransactionReceipt(tx.hash)
    if (!receipt) return '0'
    if (receipt.status == 0) return '0'
    const logs = receipt.logs
    if (!logs || logs.length <= 0) return '0'
    const topics = logs[logs.length - 1].topics

    switch (function_name) {
      case FunctionName.DEPOSIT:
      case FunctionName.WITHDRAW:
        if (
          receipt.to.toLowerCase() ===
          contractConfig[String(chainId ?? DEFAULT_CHAIN_ID)].keyContracts.lpFarm.addr.toLowerCase()
        ) {
          const data = logs[logs.length - 1].data
          if (!data) return '0'
          return logs[logs.length - 1].data
        } else {
          if (!topics || topics.length <= 0) return '0'
          return topics[topics.length - 1]
        }
      case FunctionName.SUBMIT_CLAIM:
        if (!topics || topics.length <= 0) return '0'
        return topics[topics.length - 1]
      case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
        if (!topics || topics.length <= 0) return '0'
        return topics[1]
      case FunctionName.BUY_POLICY:
      case FunctionName.EXTEND_POLICY:
      case FunctionName.CANCEL_POLICY:
      case FunctionName.DEPOSIT_ETH:
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_ETH:
      case FunctionName.WITHDRAW_REWARDS:
      case FunctionName.DEPOSIT_SIGNED:
      case FunctionName.WITHDRAW_LP:
      case FunctionName.APPROVE:
        const data = logs[logs.length - 1].data
        if (!data) return '0'
        return logs[logs.length - 1].data
      case FunctionName.MULTI_CALL:
      default:
        if (!topics || topics.length <= 0) return '0'
        return topics[1]
    }
  }

  const getTransactionAmounts = async () => {
    if (txHistory) {
      const currentAmounts = []
      for (let tx_i = 0; tx_i < txHistory.length; tx_i++) {
        const function_name = decodeInput(txHistory[tx_i], contractSources).function_name
        if (!function_name) {
          currentAmounts.push('N/A')
        } else {
          const amount: string = await getTransactionAmount(function_name, txHistory[tx_i], library)
          currentAmounts.push(
            `${formatTransactionContent(function_name, amount, chainId ?? DEFAULT_CHAIN_ID, txHistory[tx_i].to)}`
          )
        }
      }
      setAmounts(currentAmounts)
    }
  }

  useEffect(() => {
    getTransactionAmounts()
  }, [txHistory])

  return { txHistory, amounts }
}
