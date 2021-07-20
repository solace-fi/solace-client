import React, { useMemo, useContext, createContext, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useWallet } from './WalletManager'

import { LocalTx, Policy } from '../constants/types'
import { usePolicyGetter } from '../hooks/useGetter'
import { useReload } from '../hooks/useReload'
import { useInterval } from '../hooks/useInterval'

import { useFetchGasPrice } from '../hooks/useFetchGasPrice'
import { useGetLatestBlockNumber } from '../hooks/useGetLatestBlockNumber'
/*

This manager caches data concerning the user's assets, operations, or preferences into the
web app.

*/

type CachedData = {
  localTransactions: LocalTx[]
  userPolicies: { policiesLoading: boolean; userPolicies: Policy[] }
  version?: number
  dataVersion?: number
  gasPrices?: any
  latestBlock: number
  addLocalTransactions: (txToAdd: LocalTx) => void
  deleteLocalTransactions: (txsToDelete: []) => void
  removeLocalTransactions: () => void
  reload: () => void
  dataReload: () => void
}

const CachedDataContext = createContext<CachedData>({
  localTransactions: [],
  userPolicies: { policiesLoading: false, userPolicies: [] },
  version: undefined,
  dataVersion: undefined,
  gasPrices: undefined,
  latestBlock: 0,
  addLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  removeLocalTransactions: () => undefined,
  reload: () => undefined,
  dataReload: () => undefined,
})

const CachedDataProvider: React.FC = (props) => {
  const { account, chainId, disconnect } = useWallet()
  const [localTxs, setLocalTxs, removeLocalTxs] = useLocalStorage<LocalTx[]>('solace_loc_txs', [])
  const { policiesLoading, userPolicies } = usePolicyGetter(account)
  const [reload, version] = useReload()
  const [dataReload, dataVersion] = useReload()
  const gasPrices = useFetchGasPrice()
  const latestBlock = useGetLatestBlockNumber()

  const addLocalTransactions = (txToAdd: LocalTx) => {
    if (localTxs !== undefined) {
      setLocalTxs([txToAdd, ...localTxs])
    }
  }

  const deleteLocalTransactions = (txsToDelete: LocalTx[]) => {
    if (txsToDelete.length == 0) return
    const formattedTxsToDelete: LocalTx[] = []
    for (let i = 0; i < txsToDelete.length; i++) {
      formattedTxsToDelete.push(txsToDelete[i].hash)
    }
    const passedLocalTxs = localTxs.filter(
      (tx: LocalTx) => !formattedTxsToDelete.includes(tx.hash) && tx.status !== 'Complete'
    )
    setLocalTxs(passedLocalTxs)
  }

  const clearLocalTransactions = useCallback(() => {
    removeLocalTxs()
  }, [disconnect, account, chainId])

  useInterval(() => {
    dataReload()
  }, 3500)

  const value = useMemo<CachedData>(
    () => ({
      localTransactions: localTxs,
      userPolicies: { policiesLoading, userPolicies },
      version,
      dataVersion,
      gasPrices,
      latestBlock,
      addLocalTransactions,
      deleteLocalTransactions,
      removeLocalTransactions: clearLocalTransactions,
      reload,
      dataReload,
    }),
    [addLocalTransactions, deleteLocalTransactions, removeLocalTxs, gasPrices, version, dataVersion, userPolicies]
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
