import React, { useMemo, useContext, createContext, useEffect, useCallback, useState } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useWallet } from './WalletManager'

import { GasData, LocalTx } from '../constants/types'
import { useReload } from '../hooks/internal/useReload'

import { useFetchGasData } from '../hooks/provider/useGas'

import { useNetwork } from './NetworkManager'
import { useGetCrossTokenPricesFromCoingecko } from '../hooks/api/usePrice'
import { useWeb3React } from '@web3-react/core'
import {
  BigNumber,
  GlobalLockInfo,
  SolaceRiskProtocol,
  SolaceRiskScore,
  SolaceRiskSeries,
  TokenToPriceMapping,
} from '@solace-fi/sdk-nightly'
import { useCheckIsCoverageActive, usePortfolio, useRiskSeries } from '../hooks/policy/useSolaceCoverProductV3'
import { useScpBalance } from '../hooks/balance/useBalance'
import { usePortfolioAnalysis } from '../hooks/policy/usePortfolioAnalysis'
import { ZERO } from '../constants'
import axios from 'axios'

/*

This manager caches data such as the user's pending transactions, policies, token and position data.

Currently, the reload feature takes place in this manager as well, this feature is called and
read by components and hooks across the app to stay in sync with each other. This reload feature
should be called manually, such as when the user sends a transaction.

*/

type CachedData = {
  localTransactions: LocalTx[]
  tokenPriceMapping: TokenToPriceMapping
  minute: number
  positiveVersion: number // primary timekeeper, triggers updates in components that read this
  negativeVersion: number // secondary timekeeper, triggers updates in components that read this  minute: number
  gasData: GasData | undefined
  statsCache: any
  addLocalTransactions: (txToAdd: LocalTx) => void
  deleteLocalTransactions: (txsToDelete: { hash: string }[]) => void
  positiveReload: () => void // primary timekeeper intended for reloading UI and data
  negativeReload: () => void // secondary timekeeper intended for reloading UI but not data
  coverage: {
    portfolio?: SolaceRiskScore
    fetchStatus: number
    policyId?: BigNumber
    status: boolean
    coverageLimit: BigNumber
    curHighestPosition?: SolaceRiskProtocol
    curUsdBalanceSum: number
    curDailyRate: number
    curDailyCost: number
    scpBalance: string
    portfolioLoading: boolean
    coverageLoading: boolean
  }
  seriesKit: {
    series?: SolaceRiskSeries
    seriesLogos: { label: string; value: string; iconUrl?: string }[]
    seriesLoading: boolean
  }
  staking: {
    globalLockStats: GlobalLockInfo
    handleGlobalLockStats: (_stats: GlobalLockInfo) => void
    canFetchGlobalStatsFlag: boolean
    handleCanFetchGlobalStatsFlag: (_flag: boolean) => void
  }
}

const CachedDataContext = createContext<CachedData>({
  localTransactions: [],
  tokenPriceMapping: {},
  positiveVersion: 0,
  negativeVersion: 0,
  minute: 0,
  gasData: undefined,
  statsCache: undefined,
  addLocalTransactions: () => undefined,
  deleteLocalTransactions: () => undefined,
  positiveReload: () => undefined,
  negativeReload: () => undefined,
  coverage: {
    portfolio: undefined,
    fetchStatus: 0,
    policyId: undefined,
    status: false,
    coverageLimit: ZERO,
    curHighestPosition: undefined,
    curUsdBalanceSum: 0,
    curDailyRate: 0,
    curDailyCost: 0,
    scpBalance: '',
    portfolioLoading: true,
    coverageLoading: true,
  },
  seriesKit: {
    series: undefined,
    seriesLogos: [],
    seriesLoading: true,
  },
  staking: {
    globalLockStats: {
      solaceStaked: '0',
      valueStaked: '0',
      numLocks: '0',
      rewardPerSecond: '0',
      apr: '0',
      successfulFetch: false,
    },
    handleGlobalLockStats: () => undefined,
    canFetchGlobalStatsFlag: true,
    handleCanFetchGlobalStatsFlag: () => undefined,
  },
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
  const { portfolio, loading: portfolioLoading, fetchStatus } = usePortfolio()
  const { policyId, status, coverageLimit, mounting: coverageLoading } = useCheckIsCoverageActive()
  const scpBalance = useScpBalance()
  const { series, loading: seriesLoading } = useRiskSeries()
  const [statsCache, setStatsCache] = useState<any>(undefined)

  const seriesLogos = useMemo(() => {
    return series
      ? series.data.protocolMap.map((s) => {
          return {
            label: s.appId,
            value: s.appId,
            icon: `https://assets.solace.fi/zapperLogos/${s.appId}`,
          }
        })
      : []
  }, [series])

  const {
    highestPosition: curHighestPosition,
    usdBalanceSum: curUsdBalanceSum,
    dailyRate: curDailyRate,
    dailyCost: curDailyCost,
  } = usePortfolioAnalysis(portfolio, coverageLimit)

  const [globalLockStats, setGlobalLockStats] = useState<GlobalLockInfo>({
    solaceStaked: '0',
    valueStaked: '0',
    numLocks: '0',
    rewardPerSecond: '0',
    apr: '0',
    successfulFetch: false,
  })

  const [canFetchGlobalStatsFlag, setCanFetchGlobalStatsFlag] = useState<boolean>(true)

  const handleCanFetchGlobalStatsFlag = useCallback((_flag: boolean) => {
    setCanFetchGlobalStatsFlag(_flag)
  }, [])

  const handleGlobalLockStats = useCallback((_stats: GlobalLockInfo) => {
    setGlobalLockStats(_stats)
  }, [])

  const addLocalTransactions = useCallback(
    (txToAdd: LocalTx) => {
      setLocalTxs([txToAdd, ...localTxs])
    },
    [localTxs]
  )

  const deleteLocalTransactions = useCallback(
    (txsToDelete: { hash: string }[]) => {
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
    handleCanFetchGlobalStatsFlag(true)
  }, [activeNetwork])

  useEffect(() => {
    const clearLocalTransactions = () => {
      setLocalTxs([])
    }
    clearLocalTransactions()
  }, [disconnect, account, activeNetwork.chainId])

  useEffect(() => {
    const getStatsCache = async () => {
      const _statsCache = await axios.get('https://stats-cache.solace.fi/analytics-stats.json')
      if (_statsCache.data) {
        setStatsCache(_statsCache.data)
      }
    }
    getStatsCache()
  }, [])

  const value = useMemo<CachedData>(
    () => ({
      localTransactions: localTxs,
      tokenPriceMapping,
      positiveReload,
      negativeReload,
      positiveVersion,
      negativeVersion,
      minute,
      gasData,
      statsCache,
      addLocalTransactions,
      deleteLocalTransactions,
      coverage: {
        portfolio,
        fetchStatus,
        policyId,
        status,
        coverageLimit,
        curHighestPosition,
        curUsdBalanceSum,
        curDailyRate,
        curDailyCost,
        scpBalance,
        portfolioLoading,
        coverageLoading,
      },
      seriesKit: {
        series,
        seriesLogos,
        seriesLoading,
      },
      staking: {
        globalLockStats,
        handleGlobalLockStats,
        canFetchGlobalStatsFlag,
        handleCanFetchGlobalStatsFlag,
      },
    }),
    [
      minute,
      localTxs,
      tokenPriceMapping,
      addLocalTransactions,
      deleteLocalTransactions,
      positiveReload,
      negativeReload,
      positiveVersion,
      negativeVersion,
      gasData,
      statsCache,
      portfolio,
      fetchStatus,
      policyId,
      status,
      coverageLimit,
      curHighestPosition,
      curUsdBalanceSum,
      curDailyRate,
      curDailyCost,
      scpBalance,
      portfolioLoading,
      coverageLoading,
      series,
      seriesLogos,
      seriesLoading,
      globalLockStats,
      handleGlobalLockStats,
      canFetchGlobalStatsFlag,
      handleCanFetchGlobalStatsFlag,
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
