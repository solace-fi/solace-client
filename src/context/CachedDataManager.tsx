import React, { useMemo, useContext, createContext, useEffect, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useWallet } from './WalletManager'

import { GasData, LocalTx } from '../constants/types'
import { useReload } from '../hooks/internal/useReload'

import { useFetchGasData } from '../hooks/provider/useGas'

import { useNetwork } from './NetworkManager'
import { useGetCrossTokenPricesFromCoingecko } from '../hooks/api/usePrice'
import { useWeb3React } from '@web3-react/core'
import { TokenToPriceMapping } from '@solace-fi/sdk-nightly'

/*

This manager caches data such as the user's pending transactions, policies, token and position data.

Currently, the reload feature takes place in this manager as well, this feature is called and
read by components and hooks across the app to stay in sync with each other. This reload feature
should be called manually, such as when the user sends a transaction.

*/

type CachedData = {
  localTransactions: LocalTx[]
  tokenPriceMapping: TokenToPriceMapping
  positiveVersion: number // primary timekeeper, triggers updates in components that read this
  negativeVersion: number // secondary timekeeper, triggers updates in components that read this
  minute: number
  gasData: GasData | undefined
  addLocalTransactions: (txToAdd: LocalTx) => void
  deleteLocalTransactions: (txsToDelete: []) => void
  positiveReload: () => void // primary timekeeper intended for reloading UI and data
  negativeReload: () => void // secondary timekeeper intended for reloading UI but not data
}

const CachedDataContext = createContext<CachedData>({
  localTransactions: [],
  tokenPriceMapping: {},
  positiveVersion: 0,
  negativeVersion: 0,
  minute: 0,
  gasData: undefined,
  addLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  positiveReload: () => undefined,
  negativeReload: () => undefined,
})

const CachedDataProvider: React.FC = (props) => {
  const { account } = useWeb3React()
  const { disconnect } = useWallet()
  const { activeNetwork } = useNetwork()
  const [localTxs, setLocalTxs] = useLocalStorage<LocalTx[]>('solace_loc_txs', [])
  const [positiveReload, positiveVersion] = useReload()
  const [negativeReload, negativeVersion] = useReload()
  const [minReload, minute] = useReload()
  const { tokenPriceMapping } = useGetCrossTokenPricesFromCoingecko(minute)
  const gasData = useFetchGasData()

  const addLocalTransactions = useCallback(
    (txToAdd: LocalTx) => {
      setLocalTxs([txToAdd, ...localTxs])
    },
    [localTxs]
  )

  const deleteLocalTransactions = useCallback(
    (txsToDelete: LocalTx[]) => {
      if (txsToDelete.length == 0) return
      const formattedTxsToDelete = txsToDelete.map((tx) => tx.hash.toLowerCase())
      const passedLocalTxs = localTxs.filter(
        (tx: LocalTx) => !formattedTxsToDelete.includes(tx.hash.toLowerCase()) && tx.status !== 'Complete'
      )
      setLocalTxs(passedLocalTxs)
    },
    [localTxs]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      minReload()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const clearLocalTransactions = () => {
      setLocalTxs([])
    }
    clearLocalTransactions()
  }, [disconnect, account, activeNetwork.chainId])

  const value = useMemo<CachedData>(
    () => ({
      localTransactions: localTxs,
      tokenPriceMapping,
      minute,
      gasData,
      addLocalTransactions,
      deleteLocalTransactions,
      positiveReload,
      negativeReload,
      positiveVersion,
      negativeVersion,
    }),
    [
      minute,
      localTxs,
      tokenPriceMapping,
      addLocalTransactions,
      deleteLocalTransactions,
      gasData,
      positiveVersion,
      negativeVersion,
      positiveReload,
      negativeReload,
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
