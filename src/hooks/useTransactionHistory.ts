import { fetchExplorerTxHistoryByAddress } from '../utils/explorer'
import { useState, useEffect } from 'react'
import { useCachedData } from '../context/CachedDataManager'
import { useWallet } from '../context/WalletManager'
import { FunctionName } from '../constants/enums'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { decodeInput } from '../utils/decoder'
import { formatTransactionContent } from '../utils/formatting'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'

export const useFetchTxHistoryByAddress = (): any => {
  const { account } = useWallet()
  const { activeNetwork } = useNetwork()
  const { deleteLocalTransactions, latestBlock } = useCachedData()
  const [txHistory, setTxHistory] = useState<any>([])
  const { contractSources } = useContracts()

  const fetchTxHistoryByAddress = async (account: string) => {
    await fetchExplorerTxHistoryByAddress(activeNetwork.explorer.apiUrl, account, contractSources)
      .then((result) => {
        if (result.status == '1') {
          const contractAddrs = contractSources.map((contract) => contract.addr)
          const txList = result.result.filter((tx: any) => contractAddrs.includes(tx.to.toLowerCase()))
          deleteLocalTransactions(txList)
          setTxHistory(txList.slice(0, 30))
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    if (!latestBlock || !account) return
    fetchTxHistoryByAddress(account)
  }, [latestBlock, account])

  return txHistory
}

export const useTransactionDetails = (): { txHistory: any; amounts: string[] } => {
  const { library } = useWallet()
  const { activeNetwork } = useNetwork()
  const [amounts, setAmounts] = useState<string[]>([])
  const { contractSources } = useContracts()
  const txHistory = useFetchTxHistoryByAddress()

  const getTransactionAmount = async (
    function_name: string,
    tx: any,
    provider: Web3Provider | Provider
  ): Promise<string> => {
    const receipt = await provider.getTransactionReceipt(tx.hash)
    if (!receipt) return ''
    if (receipt.status == 0) return ''
    const logs = receipt.logs
    if (!logs || logs.length <= 0) return ''
    const topics = logs[logs.length - 1].topics

    switch (function_name) {
      case FunctionName.DEPOSIT_ETH:
        // same method name between vault and CpFarm
        if (receipt.to.toLowerCase() === activeNetwork.config.keyContracts.vault.addr.toLowerCase()) return logs[0].data
        // same method name between vault and bond teller
        if (activeNetwork.cache.tellerToTokenMapping[receipt.to.toLowerCase()]) {
          const edTopics = logs[logs.length - 2].topics
          return edTopics[edTopics.length - 1]
        }
        return logs[logs.length - 1].data
      case FunctionName.WITHDRAW_ETH:
        return logs[0].data
      case FunctionName.SUBMIT_CLAIM:
        if (!topics || topics.length <= 0) return ''
        return topics[topics.length - 1]
      case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
      case FunctionName.BUY_POLICY:
        if (!topics || topics.length <= 0) return ''
        return topics[1]
      case FunctionName.EXTEND_POLICY_PERIOD:
      case FunctionName.UPDATE_POLICY:
      case FunctionName.UPDATE_POLICY_AMOUNT:
      case FunctionName.CANCEL_POLICY:
        if (!topics || topics.length <= 0) return ''
        return topics[1]
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_CP:
      case FunctionName.WITHDRAW_REWARDS:
      case FunctionName.DEPOSIT_LP_SIGNED:
      case FunctionName.WITHDRAW_LP:
      case FunctionName.APPROVE:
        const data = logs[logs.length - 1].data
        if (!data) return ''
        return logs[logs.length - 1].data
      case FunctionName.BOND_DEPOSIT_ERC20:
      case FunctionName.BOND_DEPOSIT_WETH:
      case FunctionName.BOND_REDEEM:
        const edTopics = logs[logs.length - 2].topics
        return edTopics[edTopics.length - 1]
      case FunctionName.MULTI_CALL:
      default:
        if (!topics || topics.length <= 0) return ''
        return topics[1]
    }
  }

  const getTransactionAmounts = async () => {
    if (txHistory) {
      const currentAmounts = []
      for (let tx_i = 0; tx_i < txHistory.length; tx_i++) {
        // console.log(txHistory[tx_i].hash)
        const function_name = decodeInput(txHistory[tx_i], contractSources).function_name
        if (!function_name) {
          currentAmounts.push('N/A')
        } else {
          const amount: string = await getTransactionAmount(function_name, txHistory[tx_i], library)
          currentAmounts.push(`${formatTransactionContent(function_name, amount, activeNetwork)}`)
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
