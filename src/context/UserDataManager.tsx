import React, { useMemo, useContext, createContext, useEffect, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
// import { useProvider } from './ProviderManager'
import { useWallet } from './WalletManager'

type LocalTx = {
  hash: any
  type: string
  value: string
  status: string
}

export type UserData = {
  localTransactions: any[] | undefined
  addLocalTransactions: (txToAdd: LocalTx) => void
  updateLocalTransactions: (txToUpdate: LocalTx, newStatus: string) => void
  deleteLocalTransactions: (txsToDelete: []) => void
  removeLocalTransactions: () => void
}

const UserDataContext = createContext<UserData>({
  localTransactions: [],
  addLocalTransactions: () => undefined,
  updateLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  removeLocalTransactions: () => undefined,
})

const UserDataProvider: React.FC = (props) => {
  const { account, chainId, disconnect } = useWallet()
  const [localTxs, setLocalTxs, removeLocalTxs] = useLocalStorage<LocalTx[] | undefined>('solace_loc_txs', [])

  const addLocalTransactions = (txToAdd: LocalTx) => {
    console.log('calling addLocalTransactions', localTxs, '\n txToAdd', txToAdd)
    if (localTxs !== undefined) {
      setLocalTxs([txToAdd, ...localTxs])
    }
  }

  const updateLocalTransactions = (txToUpdate: LocalTx, newStatus: string) => {
    console.log('calling updateLocalTransactions', localTxs, '\n txToUpdate', txToUpdate)
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
      const passedLocalTxs = localTxs.filter((tx: LocalTx) => !formattedTxsToDelete.includes(tx.hash))
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
