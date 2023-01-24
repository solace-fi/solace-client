import { hydrateLibrary, listSIPs } from '@solace-fi/hydrate'
import { ZERO } from '@solace-fi/sdk-nightly'
import axios from 'axios'
import { BigNumber } from 'ethers'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { MassUwpDataPortfolio } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { FetchedPremiums } from './types/FetchedPremiums'
import { FetchedSipMathLib } from './types/SipMathLib'
import { BlockData, FetchedUWPData } from './types/UWPData'
import { useUwp } from '../../hooks/lock/useUnderwritingHelper'
import { validateTokenArrays } from '../../utils'
import { ProtocolExposureType } from './constants'
import { useSpiExposures } from '../../hooks/analytics/useSpiExposures'
import { reformatDataForAreaChart } from './utils/reformatDataForAreaChart'
import { getPortfolioVolatility } from './utils/getPortfolioVolatility'
import { getPortfolioDetailData } from './utils/getPortfolioDetailData'
import { useAnalyticsData } from '../../hooks/analytics/useAnalyticsData'

export type TimestampedTokenNumberValues = {
  timestamp: number
  [key: string]: number
}
export type ReformattedData = {
  output: TimestampedTokenNumberValues[]
  allTokenKeys: string[]
}

type AnalyticsContextType = {
  intrface: {}
  data: {
    tokenHistogramTickers: string[]
    trials: number
    portfolioVolatilityData: number[]
    priceHistory30D: TimestampedTokenNumberValues[]
    allDataPortfolio: MassUwpDataPortfolio[]
    fetchedSipMathLib: FetchedSipMathLib | undefined
    fetchedUwpData: FetchedUWPData | undefined
    fetchedPremiums: FetchedPremiums | undefined
    tokenDetails: { symbol: string; price: number; weight: number }[]
    uwpValueUSD: BigNumber
    premiumsUSD: number
    protocolExposureData: ProtocolExposureType[]
  }
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  intrface: {},
  data: {
    tokenHistogramTickers: [],
    trials: 0,
    portfolioVolatilityData: [],
    priceHistory30D: [],
    allDataPortfolio: [],
    fetchedSipMathLib: undefined,
    fetchedUwpData: undefined,
    fetchedPremiums: undefined,
    tokenDetails: [],
    uwpValueUSD: ZERO,
    premiumsUSD: 0,
    protocolExposureData: [],
  },
})

export const getWeightsFromBalances = (balances: number[]): number[] => {
  const sum = balances.reduce((a: number, b: number) => a + b, 0)
  const weights = balances.map((balance) => balance / sum)
  return weights
}

const AnalyticsManager: React.FC = ({ children }) => {
  const { activeNetwork } = useNetwork()
  const { valueOfPool } = useUwp()
  const [uwpValueUSD, setUwpValueUSD] = useState<BigNumber>(ZERO)

  const [fetchedUwpData, setFetchedUwpData] = useState<FetchedUWPData | undefined>(undefined)
  const [fetchedSipMathLib, setFetchedSipMathLib] = useState<FetchedSipMathLib | undefined>(undefined)
  const [fetchedPremiums, setFetchedPremiums] = useState<FetchedPremiums | undefined>(undefined)

  const protocolExposureData = useSpiExposures()

  const premiumsUSD = useMemo(() => {
    if (!fetchedPremiums || !fetchedPremiums?.[activeNetwork.chainId]) return 0
    const premiumsByChainId = fetchedPremiums?.[activeNetwork.chainId]
    const latestEpoch = premiumsByChainId.history[premiumsByChainId.history.length - 1]
    return Number(latestEpoch.uweAmount) * Number(latestEpoch.uwpValuePerShare) * Number(latestEpoch.uwpPerUwe)
  }, [activeNetwork.chainId, fetchedPremiums])

  const TRIALS = 1000

  const analyticsData = useAnalyticsData(5, TRIALS, fetchedUwpData, fetchedSipMathLib, fetchedPremiums) // goerli

  useEffect(() => {
    const init = async () => {
      const _valueOfPool = await valueOfPool()
      setUwpValueUSD(_valueOfPool)
    }
    init()
  }, [activeNetwork, valueOfPool])

  useEffect(() => {
    const init = async () => {
      const [analytics, sipMathLib, premiums] = await Promise.all([
        axios.get('https://stats-cache.solace.fi/native_uwp/all.json'),
        axios.get(`https://stats-cache.solace.fi/volatility.json`),
        axios.get('https://stats-cache.solace.fi/native_premiums/all.json'),
      ])
      setFetchedUwpData((analytics.data as unknown) as FetchedUWPData)
      setFetchedSipMathLib((sipMathLib.data as unknown) as FetchedSipMathLib)
      setFetchedPremiums((premiums.data as unknown) as FetchedPremiums)
    }
    setTimeout(() => {
      init()
    }, 200)
  }, [])

  const value = useMemo(
    () => ({
      intrface: {},
      data: {
        tokenHistogramTickers: analyticsData.tokenHistogramTickers,
        trials: TRIALS,
        portfolioVolatilityData: analyticsData.portfolioVolatilityData,
        priceHistory30D: analyticsData.priceHistory30D,
        allDataPortfolio: analyticsData.allDataPortfolio,
        fetchedUwpData,
        fetchedPremiums,
        fetchedSipMathLib,
        tokenDetails: analyticsData.tokenDetails,
        uwpValueUSD,
        premiumsUSD,
        protocolExposureData,
      },
    }),
    [analyticsData, fetchedUwpData, fetchedSipMathLib, fetchedPremiums, uwpValueUSD, protocolExposureData, premiumsUSD]
  )
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext(): AnalyticsContextType {
  return useContext(AnalyticsContext)
}

export default AnalyticsManager
