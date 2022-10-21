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
import { useSpiExposures } from '../../hooks/policy/useSpiExposures'
import { reformatDataForAreaChart } from './utils/reformatDataForAreaChart'
import { getPortfolioVolatility } from './utils/getPortfolioVolatility'
import { getPortfolioDetailData } from './utils/getPortfolioDetailData'

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
    portfolioHistogramTickers: string[]
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
    portfolioHistogramTickers: [],
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
  const protocolExposureData = useSpiExposures()
  const [portfolioHistogramTickers, setPortfolioHistogramTickers] = useState<string[]>([])
  const [tokenHistogramTickers, setTokenHistogramTickers] = useState<string[]>([])
  const [portfolioVolatilityData, setPortfolioVolatilityData] = useState<number[]>([])
  const [priceHistory30D, setPriceHistory30D] = useState<TimestampedTokenNumberValues[]>([])
  const [allDataPortfolio, setAllDataPortfolio] = useState<MassUwpDataPortfolio[]>([])
  const [tokenDetails, setTokenDetails] = useState<{ symbol: string; price: number; weight: number }[]>([])
  const [uwpValueUSD, setUwpValueUSD] = useState<BigNumber>(ZERO)

  const [fetchedUwpData, setFetchedUwpData] = useState<FetchedUWPData | undefined>(undefined)
  const [fetchedSipMathLib, setFetchedSipMathLib] = useState<FetchedSipMathLib | undefined>(undefined)
  const [fetchedPremiums, setFetchedPremiums] = useState<FetchedPremiums | undefined>(undefined)

  const premiumsUSD = useMemo(() => {
    if (!fetchedPremiums || !fetchedPremiums?.[activeNetwork.chainId]) return 0
    const premiumsByChainId = fetchedPremiums?.[activeNetwork.chainId]
    const latestEpoch = premiumsByChainId.history[premiumsByChainId.history.length - 1]
    return Number(latestEpoch.uweAmount) * Number(latestEpoch.uwpValuePerShare) * Number(latestEpoch.uwpPerUwe)
  }, [activeNetwork, fetchedPremiums])

  const TRIALS = 1000

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

  useEffect(() => {
    const getData = async () => {
      if (!fetchedUwpData || !fetchedSipMathLib || !fetchedSipMathLib.sips) return
      if (!(fetchedUwpData[activeNetwork.chainId.toString()] as BlockData[])) return

      const { output: _priceHistory30D, allTokenKeys } = reformatDataForAreaChart(
        fetchedUwpData[`${activeNetwork.chainId}`]
      )
      setTokenHistogramTickers(fetchedSipMathLib.sips.map((item) => item.name.toLowerCase()))
      setPortfolioHistogramTickers(allTokenKeys)
      setPriceHistory30D(_priceHistory30D)

      const numSips = listSIPs(fetchedSipMathLib).map((item) => item.toLowerCase())

      const _simulatedReturns: { [key: string]: number[] } = hydrateLibrary(fetchedSipMathLib, TRIALS)

      if (validateTokenArrays(allTokenKeys, numSips)) {
        const allDataPortfolio: MassUwpDataPortfolio[] = getPortfolioDetailData(
          fetchedUwpData[`${activeNetwork.chainId}`],
          _simulatedReturns,
          allTokenKeys
        )
        const tokenWeights = getWeightsFromBalances(
          allDataPortfolio.map((token: MassUwpDataPortfolio) => token.usdBalance)
        )
        const adjustedPortfolio: MassUwpDataPortfolio[] = allDataPortfolio.map((token, i: number) => {
          return {
            ...token,
            weight: tokenWeights[i],
          }
        })
        setTokenDetails(
          adjustedPortfolio.map((token: MassUwpDataPortfolio) => {
            return {
              symbol: token.symbol,
              weight: token.weight,
              price: token.price,
            }
          })
        )

        const _portfolioVolatilityData = getPortfolioVolatility(
          tokenWeights,
          adjustedPortfolio.map((token: MassUwpDataPortfolio) => token.simulation),
          TRIALS
        )
        setPortfolioVolatilityData(_portfolioVolatilityData)
        setAllDataPortfolio(adjustedPortfolio)
      }
    }
    getData()
  }, [activeNetwork, fetchedUwpData, fetchedSipMathLib])

  const value = useMemo(
    () => ({
      intrface: {},
      data: {
        portfolioHistogramTickers,
        tokenHistogramTickers,
        trials: TRIALS,
        portfolioVolatilityData,
        priceHistory30D,
        allDataPortfolio,
        fetchedUwpData,
        fetchedPremiums,
        fetchedSipMathLib,
        tokenDetails,
        uwpValueUSD,
        premiumsUSD,
        protocolExposureData,
      },
    }),
    [
      portfolioHistogramTickers,
      tokenHistogramTickers,
      portfolioVolatilityData,
      priceHistory30D,
      allDataPortfolio,
      fetchedUwpData,
      fetchedSipMathLib,
      fetchedPremiums,
      tokenDetails,
      uwpValueUSD,
      premiumsUSD,
      protocolExposureData,
    ]
  )
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext(): AnalyticsContextType {
  return useContext(AnalyticsContext)
}

export default AnalyticsManager
