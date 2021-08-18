import React, { useMemo, useContext, createContext, useEffect, useState, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useWallet } from './WalletManager'

import { LocalTx, Policy, NetworkCache } from '../constants/types'
import { usePolicyGetter } from '../hooks/useGetter'
import { useReload } from '../hooks/useReload'
import { useInterval } from '../hooks/useInterval'

import { useFetchGasPrice } from '../hooks/useFetchGasPrice'
import { useGetLatestBlockNumber } from '../hooks/useGetLatestBlockNumber'
import { useCacheTokens } from '../hooks/useCacheTokens'

import { TransactionHistoryModal } from '../components/organisms/TransactionHistoryModal'
import { useNetwork } from './NetworkManager'

/*

This manager caches data such as the user's assets, operations, or preferences into the
web app.

*/

type CachedData = {
  localTransactions: LocalTx[]
  userPolicyData: { policiesLoading: boolean; userPolicies: Policy[] }
  tokenPositionData: { dataInitialized: boolean; storedTokenAndPositionData: NetworkCache[] }
  showHistoryModal: boolean
  version: number
  dataVersion?: number
  gasPrices?: any
  latestBlock: number
  addLocalTransactions: (txToAdd: LocalTx) => void
  deleteLocalTransactions: (txsToDelete: []) => void
  openHistoryModal: () => void
  reload: () => void
}

const CachedDataContext = createContext<CachedData>({
  localTransactions: [],
  userPolicyData: { policiesLoading: false, userPolicies: [] },
  tokenPositionData: { dataInitialized: false, storedTokenAndPositionData: [] },
  showHistoryModal: false,
  version: 0,
  dataVersion: undefined,
  gasPrices: undefined,
  latestBlock: 0,
  addLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  openHistoryModal: () => undefined,
  reload: () => undefined,
})

const CachedDataProvider: React.FC = (props) => {
  const { account, disconnect } = useWallet()
  const { chainId } = useNetwork()
  const [localTxs, setLocalTxs] = useLocalStorage<LocalTx[]>('solace_loc_txs', [])
  const [reload, version] = useReload()
  const [dataReload, dataVersion] = useReload()
  const gasPrices = useFetchGasPrice()
  const latestBlock = useGetLatestBlockNumber(dataVersion)
  const { dataInitialized, storedTokenAndPositionData } = useCacheTokens()
  const { policiesLoading, userPolicies } = usePolicyGetter(
    false,
    latestBlock,
    { dataInitialized, storedTokenAndPositionData },
    version,
    account
  )
  const [historyModal, setHistoryModal] = useState<boolean>(false)

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setHistoryModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setHistoryModal(false)
  }, [])

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
      tokenPositionData: { dataInitialized, storedTokenAndPositionData },
      showHistoryModal: historyModal,
      version,
      dataVersion,
      gasPrices,
      latestBlock,
      addLocalTransactions,
      deleteLocalTransactions,
      openHistoryModal: openModal,
      reload,
    }),
    [
      localTxs,
      addLocalTransactions,
      deleteLocalTransactions,
      dataInitialized,
      storedTokenAndPositionData,
      version,
      dataVersion,
      latestBlock,
      gasPrices,
      userPolicies,
      policiesLoading,
    ]
  )

  return (
    <CachedDataContext.Provider value={value}>
      <TransactionHistoryModal closeModal={closeModal} isOpen={historyModal} />
      {props.children}
    </CachedDataContext.Provider>
  )
}

export function useCachedData(): CachedData {
  return useContext(CachedDataContext)
}

const CachedDataManager: React.FC = (props) => {
  return <CachedDataProvider>{props.children}</CachedDataProvider>
}

export default CachedDataManager
