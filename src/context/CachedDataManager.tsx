import React, { useMemo, useContext, createContext, useEffect } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useWallet } from './WalletManager'

import { LocalTx, Policy } from '../constants/types'
import { usePolicyGetter } from '../hooks/useGetter'
import { useReload } from '../hooks/useReload'
import { useInterval } from '../hooks/useInterval'

import { useFetchGasPrice } from '../hooks/useFetchGasPrice'
import { useGetLatestBlockNumber } from '../hooks/useGetLatestBlockNumber'
import { useGetTokens } from '../hooks/useGetTokens'

/*

This manager caches data such as the user's assets, operations, or preferences into the
web app.

*/

type CachedData = {
  localTransactions: LocalTx[]
  userPolicyData: { policiesLoading: boolean; userPolicies: Policy[] }
  tokenPositionDataInitialized: boolean
  version: number
  dataVersion?: number
  gasPrices?: any
  latestBlock: number
  addLocalTransactions: (txToAdd: LocalTx) => void
  deleteLocalTransactions: (txsToDelete: []) => void
  reload: () => void
  dataReload: () => void
}

const CachedDataContext = createContext<CachedData>({
  localTransactions: [],
  userPolicyData: { policiesLoading: false, userPolicies: [] },
  tokenPositionDataInitialized: false,
  version: 0,
  dataVersion: undefined,
  gasPrices: undefined,
  latestBlock: 0,
  addLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  reload: () => undefined,
  dataReload: () => undefined,
})

const CachedDataProvider: React.FC = (props) => {
  const { account, chainId, disconnect } = useWallet()
  const [localTxs, setLocalTxs] = useLocalStorage<LocalTx[]>('solace_loc_txs', [])
  const [reload, version] = useReload()
  const [dataReload, dataVersion] = useReload()
  const gasPrices = useFetchGasPrice()
  const latestBlock = useGetLatestBlockNumber(dataVersion)
  const dataInitialized = useGetTokens()
  const { policiesLoading, userPolicies } = usePolicyGetter(false, latestBlock, dataInitialized, version, account)

  const addLocalTransactions = (txToAdd: LocalTx) => {
    setLocalTxs([txToAdd, ...localTxs])
  }

  const deleteLocalTransactions = (txsToDelete: LocalTx[]) => {
    if (txsToDelete.length == 0) return
    const formattedTxsToDelete = txsToDelete.map((tx) => tx.hash)
    const passedLocalTxs = localTxs.filter(
      (tx: LocalTx) => !formattedTxsToDelete.includes(tx.hash) && tx.status !== 'Complete'
    )
    setLocalTxs(passedLocalTxs)
  }

  useInterval(() => {
    dataReload()
  }, 3500)

  useEffect(() => {
    const clearLocalTransactions = () => {
      setLocalTxs([])
    }
    clearLocalTransactions()
  }, [disconnect, account, chainId])

  const value = useMemo<CachedData>(
    () => ({
      localTransactions: localTxs,
      userPolicyData: { policiesLoading, userPolicies },
      tokenPositionDataInitialized: dataInitialized,
      version,
      dataVersion,
      gasPrices,
      latestBlock,
      addLocalTransactions,
      deleteLocalTransactions,
      reload,
      dataReload,
    }),
    [
      localTxs,
      addLocalTransactions,
      deleteLocalTransactions,
      dataInitialized,
      version,
      dataVersion,
      latestBlock,
      gasPrices,
      userPolicies,
      policiesLoading,
    ]
  )

  return <CachedDataContext.Provider value={value}>{props.children}</CachedDataContext.Provider>
}

export function useCachedData(): CachedData {
  return useContext(CachedDataContext)
}

const CachedDataManager: React.FC = (props) => {
  return <CachedDataProvider>{props.children}</CachedDataProvider>
}

export default CachedDataManager
