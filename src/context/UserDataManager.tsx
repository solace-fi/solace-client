import React, { useMemo, useContext, createContext, useEffect } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useProvider } from './ProviderManager'
import { useWallet } from './WalletManager'

export type UserData = {
  pendingTransactions: any | undefined
  addPendingTransactions: (txsToAdd: any[]) => void
  deletePendingTransactions: (txsToDelete: any[]) => void
  removePendingTransactions: () => void
}

const UserDataContext = createContext<UserData>({
  pendingTransactions: undefined,
  addPendingTransactions: () => undefined,
  deletePendingTransactions: () => undefined,
  removePendingTransactions: () => undefined,
})

const UserDataProvider: React.FC = (props) => {
  const provider = useProvider()
  const { account, version, web3Provider, reload } = useWallet()
  const [pendingTxs, setPendingTxs, removePendingTxs] = useLocalStorage<any | undefined>('pending_txs', [])

  const addPendingTransactions = (txToAdd: any) => {
    if (pendingTxs) {
      // setPendingTxs([txToAdd, ...pendingTxs])
    }
    reload()
  }

  const deletePendingTransactions = (txsToDelete: any[]) => {
    if (pendingTxs) {
      const filteredPendingTxs = pendingTxs.filter((finishedtx: any) => !txsToDelete.includes(finishedtx))
      if (filteredPendingTxs !== pendingTxs) {
        reload()
      }
      // setPendingTxs(filteredPendingTxs)
    }
  }

  useEffect(() => {
    const configAlchemy = async () => {
      if (provider.alchemyProvider) {
        const pendingSub = provider.alchemyProvider.eth.subscribe('alchemy_fullPendingTransactions')
        pendingSub.on('data', (tx: any) => {
          if (tx.from == account?.toLowerCase()) {
            console.log(tx)
            addPendingTransactions(tx)
          }
        })

        web3Provider?.on('block', (blockNum: any) => {
          web3Provider.getBlock(blockNum).then((res: any) => {
            deletePendingTransactions(res.transactions)
          })
        })
      }
    }
    configAlchemy()

    return () => {
      provider.alchemyProvider?.eth.clearSubscriptions((res) => {
        console.log('cleared subscription', res)
      })
    }
  }, [provider, account, version])

  const value = useMemo<UserData>(
    () => ({
      pendingTransactions: pendingTxs,
      addPendingTransactions,
      deletePendingTransactions,
      removePendingTransactions: removePendingTxs,
    }),
    []
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
