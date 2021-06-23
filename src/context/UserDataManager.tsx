import React, { useMemo, useContext, createContext, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { Contract } from '@ethersproject/contracts'
import { useWallet } from './WalletManager'

/*

This manager caches data concerning the user's assets, operations, or preferences into the
web app. Currently, the only data cached here are local transactions.

*/

type LocalTx = {
  hash: any
  type: string
  value: string
  status: string
  unit: string
}

export type UserData = {
  localTransactions: any[] | undefined
  addLocalTransactions: (txToAdd: LocalTx) => void
  updateLocalTransactions: (txToUpdate: LocalTx, newStatus: string) => void
  deleteLocalTransactions: (txsToDelete: []) => void
  removeLocalTransactions: () => void
}

const UserDataContext = createContext<UserData>({
  localTransactions: undefined,
  addLocalTransactions: () => undefined,
  updateLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  removeLocalTransactions: () => undefined,
})

const UserDataProvider: React.FC = (props) => {
  const { account, chainId, disconnect } = useWallet()
  const [localTxs, setLocalTxs, removeLocalTxs] = useLocalStorage<LocalTx[] | undefined>('solace_loc_txs', [])

  const addLocalTransactions = (txToAdd: LocalTx) => {
    if (localTxs !== undefined) {
      setLocalTxs([txToAdd, ...localTxs])
    }
  }

  const updateLocalTransactions = (txToUpdate: LocalTx, newStatus: string) => {
    if (localTxs) {
      const updatedLocalTxs = localTxs.map((tx: LocalTx) =>
        txToUpdate.hash == tx.hash ? { ...tx, status: newStatus } : tx
      )
      setLocalTxs(updatedLocalTxs)
    }
  }

  const deleteLocalTransactions = (txsToDelete: any[]) => {
    if (localTxs) {
      const formattedTxsToDelete: any = []
      for (let i = 0; i < txsToDelete.length; i++) {
        formattedTxsToDelete.push(txsToDelete[i].hash)
      }
      const passedLocalTxs = localTxs.filter(
        (tx: LocalTx) => !formattedTxsToDelete.includes(tx.hash) && tx.status !== 'Complete'
      )
      setLocalTxs(passedLocalTxs)
    }
  }

  const clearLocalTransactions = useCallback(() => {
    removeLocalTxs()
  }, [disconnect, account, chainId])

  const value = useMemo<UserData>(
    () => ({
      localTransactions: localTxs,
      addLocalTransactions,
      updateLocalTransactions,
      deleteLocalTransactions,
      removeLocalTransactions: clearLocalTransactions,
    }),
    [localTxs, addLocalTransactions, updateLocalTransactions]
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
