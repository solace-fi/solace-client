import React, { useMemo, useContext, createContext, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useWallet } from './WalletManager'

import { LocalTx } from '../constants/types'

/*

This manager caches data concerning the user's assets, operations, or preferences into the
web app. Currently, the only data cached here are local transactions.

*/

type UserData = {
  localTransactions: LocalTx[] | undefined
  addLocalTransactions: (txToAdd: LocalTx) => void
  deleteLocalTransactions: (txsToDelete: []) => void
  removeLocalTransactions: () => void
}

const UserDataContext = createContext<UserData>({
  localTransactions: undefined,
  addLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  removeLocalTransactions: () => undefined,
})

const UserDataProvider: React.FC = (props) => {
  const { account, chainId, disconnect } = useWallet()
  const [localTxs, setLocalTxs, removeLocalTxs] = useLocalStorage<LocalTx[]>('solace_loc_txs', [])

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

  const value = useMemo<UserData>(
    () => ({
      localTransactions: localTxs,
      addLocalTransactions,
      deleteLocalTransactions,
      removeLocalTransactions: clearLocalTransactions,
    }),
    [localTxs, addLocalTransactions]
  )

  return <UserDataContext.Provider value={value}>{props.children}</UserDataContext.Provider>
}

export function useUserData(): UserData {
  return useContext(UserDataContext)
}

const UserDataManager: React.FC = (props) => {
  return <UserDataProvider>{props.children}</UserDataProvider>
}

export default UserDataManager
