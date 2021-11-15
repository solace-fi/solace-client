import React, { useMemo, useContext, createContext, useEffect, useState, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useWallet } from './WalletManager'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'

import { LocalTx, Policy, NetworkCache, GasFeeListState, SupportedProduct } from '../constants/types'
import { usePolicyGetter } from '../hooks/usePolicyGetter'
import { useReload } from '../hooks/useReload'

import { useFetchGasPrice } from '../hooks/useGas'
import { useGetLatestBlock } from '../hooks/useGetLatestBlock'
import { useCachePositions } from '../hooks/useCachePositions'

import { useNetwork } from './NetworkManager'
import { PolicyState, SystemNotice } from '../constants/enums'
import { useGeneral } from './GeneralProvider'
import { AccountModal } from '../components/organisms/AccountModal'

/*

This manager caches data such as the user's pending transactions, policies, token and position data.

Currently, the reload feature takes place in this manager as well, this feature is called and
read by components and hooks across the app to stay in sync with each other. This reload feature
should be called manually, such as when the user sends a transaction.

*/

type CachedData = {
  localTransactions: LocalTx[]
  userPolicyData: {
    policiesLoading: boolean
    userPolicies: Policy[]
    setCanGetAssessments: (toggle: boolean) => void
  }
  tokenPosData: {
    dataInitialized: boolean
    storedPosData: NetworkCache[]
    getCache: (supportedProduct: SupportedProduct) => Promise<NetworkCache>
  }
  showAccountModal: boolean
  version: number
  gasPrices: GasFeeListState
  latestBlock: Block | undefined
  addLocalTransactions: (txToAdd: LocalTx) => void
  deleteLocalTransactions: (txsToDelete: []) => void
  openAccountModal: () => void
  reload: () => void
}

const CachedDataContext = createContext<CachedData>({
  localTransactions: [],
  userPolicyData: {
    policiesLoading: false,
    userPolicies: [],
    setCanGetAssessments: () => undefined,
  },
  tokenPosData: {
    dataInitialized: false,
    storedPosData: [],
    getCache: () => Promise.reject(),
  },
  showAccountModal: false,
  version: 0,
  gasPrices: {
    options: [],
    loading: true,
  },
  latestBlock: undefined,
  addLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  openAccountModal: () => undefined,
  reload: () => undefined,
})

const CachedDataProvider: React.FC = (props) => {
  const { account, disconnect } = useWallet()
  const { chainId } = useNetwork()
  const [localTxs, setLocalTxs] = useLocalStorage<LocalTx[]>('solace_loc_txs', [])
  const [reload, version] = useReload()
  const gasPrices = useFetchGasPrice()
  const latestBlock = useGetLatestBlock()

  const cachePositions = useCachePositions()
  const { addNotices, removeNotices } = useGeneral()
  const { policiesLoading, userPolicies, setCanGetAssessments } = usePolicyGetter(
    false,
    latestBlock,
    cachePositions,
    account
  )
  const [accountModal, setAccountModal] = useState<boolean>(false)

  const openModal = useCallback(() => {
    document.body.style.overflowY = 'hidden'
    setAccountModal(true)
  }, [])

  const closeModal = useCallback(() => {
    document.body.style.overflowY = 'scroll'
    setAccountModal(false)
  }, [])

  const addLocalTransactions = (txToAdd: LocalTx) => {
    setLocalTxs([txToAdd, ...localTxs])
  }

  const deleteLocalTransactions = (txsToDelete: LocalTx[]) => {
    if (txsToDelete.length == 0) return
    const formattedTxsToDelete = txsToDelete.map((tx) => tx.hash.toLowerCase())
    const passedLocalTxs = localTxs.filter(
      (tx: LocalTx) => !formattedTxsToDelete.includes(tx.hash.toLowerCase()) && tx.status !== 'Complete'
    )
    setLocalTxs(passedLocalTxs)
  }

  useEffect(() => {
    const clearLocalTransactions = () => {
      setLocalTxs([])
    }
    clearLocalTransactions()
  }, [disconnect, account, chainId])

  useEffect(() => {
    if (!policiesLoading) {
      let totalNumLossEvents = 0
      userPolicies.forEach(
        (policy) =>
          policy.claimAssessment &&
          policy.status == PolicyState.ACTIVE &&
          policy.claimAssessment.lossEventDetected &&
          ++totalNumLossEvents
      )
      if (totalNumLossEvents > 0) {
        addNotices([
          {
            type: SystemNotice.LOSS_EVENT_DETECTED,
            metadata: `${totalNumLossEvents} loss event${
              totalNumLossEvents > 1 ? 's' : ''
            } detected in total, view your policies for details`,
            uniqueId: `${SystemNotice.LOSS_EVENT_DETECTED}`,
          },
        ])
      } else {
        removeNotices([SystemNotice.LOSS_EVENT_DETECTED])
      }
    }
  }, [policiesLoading, userPolicies])

  const value = useMemo<CachedData>(
    () => ({
      localTransactions: localTxs,
      userPolicyData: { policiesLoading, userPolicies, setCanGetAssessments },
      tokenPosData: cachePositions,
      showAccountModal: accountModal,
      version,
      gasPrices,
      latestBlock,
      addLocalTransactions,
      deleteLocalTransactions,
      openAccountModal: openModal,
      reload,
    }),
    [
      localTxs,
      addLocalTransactions,
      deleteLocalTransactions,
      cachePositions,
      version,
      latestBlock,
      gasPrices,
      policiesLoading,
      userPolicies,
      setCanGetAssessments,
    ]
  )

  return (
    <CachedDataContext.Provider value={value}>
      <AccountModal closeModal={closeModal} isOpen={accountModal} />
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
