import { fetchExplorerTxHistoryByAddress } from '../utils/explorer'
import { useState, useEffect, useRef } from 'react'
import { useCachedData } from '../context/CachedDataManager'
import { useWallet } from '../context/WalletManager'
import { FunctionName } from '../constants/enums'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { decodeInput } from '../utils/decoder'
// import { formatTransactionContent } from '../utils/formatting'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useProvider } from '../context/ProviderManager'

export const useFetchTxHistoryByAddress = (): any => {
  const { account } = useWallet()
  const { activeNetwork } = useNetwork()
  const { deleteLocalTransactions } = useCachedData()
  const { latestBlock } = useProvider()
  const [txHistory, setTxHistory] = useState<any>([])
  const { contractSources } = useContracts()
  const running = useRef(false)

  const fetchTxHistoryByAddress = async (account: string) => {
    running.current = true
    await fetchExplorerTxHistoryByAddress(activeNetwork.explorer.apiUrl, account)
      .then((result) => {
        if (result.status == '1') {
          const contractAddrs = contractSources.map((contract) => contract.addr)
          const txList = result.result.filter((tx: any) => contractAddrs.includes(tx.to.toLowerCase()))
          deleteLocalTransactions(txList)
          setTxHistory(txList.slice(0, 30))
        }
      })
      .catch((err) => console.log(err))
    running.current = false
  }

  useEffect(() => {
    if (!latestBlock || !account || running.current) return
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
  ): Promise<{ data: string; toAddr?: string }> => {
    const receipt = await provider.getTransactionReceipt(tx.hash)
    if (!receipt) return { data: '' }
    if (receipt.status == 0) return { data: '' }
    const logs = receipt.logs
    if (!logs || logs.length <= 0) return { data: '' }
    const topics = logs[logs.length - 1].topics

    switch (function_name) {
      case FunctionName.DEPOSIT_ETH:
        // same method name between vault and CpFarm
        if (receipt.to.toLowerCase() === activeNetwork.config.keyContracts.vault.addr.toLowerCase())
          return { data: logs[0].data, toAddr: receipt.to }
        // same method name between vault and bond teller
        if (activeNetwork.cache.tellerToTokenMapping[receipt.to]) {
          const edTopics = logs[logs.length - 2].topics
          return { data: edTopics[edTopics.length - 1], toAddr: receipt.to }
        }
        return { data: logs[logs.length - 1].data, toAddr: receipt.to }
      case FunctionName.STAKE_V1:
      case FunctionName.UNSTAKE_V1:
      case FunctionName.WITHDRAW_ETH:
        return { data: logs[0].data }
      case FunctionName.SUBMIT_CLAIM:
        if (!topics || topics.length <= 0) return { data: '' }
        return { data: topics[topics.length - 1] }
      case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
      case FunctionName.BUY_POLICY:
        if (!topics || topics.length <= 0) return { data: '' }
        return { data: topics[1] }
      case FunctionName.EXTEND_POLICY_PERIOD:
      case FunctionName.UPDATE_POLICY:
      case FunctionName.UPDATE_POLICY_AMOUNT:
      case FunctionName.CANCEL_POLICY:
        if (!topics || topics.length <= 0) return { data: '' }
        return { data: topics[1] }
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_CP:
      case FunctionName.WITHDRAW_REWARDS:
      case FunctionName.DEPOSIT_LP_SIGNED:
      case FunctionName.WITHDRAW_LP:
      case FunctionName.APPROVE:
        const data = logs[logs.length - 1].data
        if (!data) return { data: '' }
        return { data }
      case FunctionName.BOND_DEPOSIT_ERC20:
      case FunctionName.BOND_DEPOSIT_WETH:
      case FunctionName.BOND_REDEEM:
        const edTopics = logs[logs.length - 2].topics
        return { data: edTopics[edTopics.length - 1] }
      case FunctionName.MULTI_CALL:
      default:
        if (!topics || topics.length <= 0) return { data: '' }
        return { data: topics[1] }
    }
  }

  // const getTransactionAmounts = async () => {
  //   if (txHistory) {
  //     const currentAmounts = []
  //     for (let tx_i = 0; tx_i < txHistory.length; tx_i++) {
  //       // console.log(txHistory[tx_i].hash)
  //       const function_name = decodeInput(txHistory[tx_i], contractSources)
  //       if (!function_name) {
  //         currentAmounts.push('N/A')
  //       } else {
  //         const txData = await getTransactionAmount(function_name, txHistory[tx_i], library)
  //         currentAmounts.push(`${formatTransactionContent(function_name, activeNetwork, txData.data, txData.toAddr)}`)
  //       }
  //     }
  //     setAmounts(currentAmounts)
  //   }
  // }

  // useEffect(() => {
  //   getTransactionAmounts()
  // }, [txHistory])

  return { txHistory, amounts }
}
