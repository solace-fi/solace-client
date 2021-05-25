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
  localTransactions: any | undefined
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
  // const provider = useProvider()
  const { account, chainId, reload, disconnect } = useWallet()
  const [localTxs, setLocalTxs, removeLocalTxs] = useLocalStorage<LocalTx[] | undefined>('local_txs', [])

  const addLocalTransactions = (txToAdd: LocalTx) => {
    console.log('calling addLocalTransactions', localTxs, 'txToAdd', txToAdd)
    if (localTxs !== undefined) {
      setLocalTxs([txToAdd, ...localTxs])
    }
  }

  const updateLocalTransactions = (txToUpdate: LocalTx, newStatus: string) => {
    console.log('calling updateLocalTransactions', localTxs, 'txToUpdate', txToUpdate)
    if (localTxs) {
      const updatedLocalTxs = localTxs.map((tx: LocalTx) =>
        txToUpdate.hash == tx.hash ? { ...tx, status: newStatus } : tx
      )
      setLocalTxs(updatedLocalTxs)
    }
  }

  const deleteLocalTransactions = (txsToDelete: any[]) => {
    console.log('calling deleteLocalTransactions', localTxs, 'txToUpdate', txsToDelete)
    if (localTxs) {
      const passedLocalTxs = localTxs.filter((tx: LocalTx) => !txsToDelete.includes(tx))
      console.log('passedLocalTxs', passedLocalTxs)
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
