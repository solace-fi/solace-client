import { hydrateLibrary, listSIPs } from '@solace-fi/hydrate'
import axios from 'axios'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MassUwpDataPortfolio } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'

type AnalyticsContextType = {
  intrface: {
    canSeePortfolioAreaChart: boolean
    canSeePortfolioVolatility: boolean
    canSeeTokenVolatilities: boolean
  }
  data: {
    portfolioHistogramTickers: string[]
    tokenHistogramTickers: string[]
    trials: number
    portfolioVolatilityData: number[]
    priceHistory30D: any[]
    allDataPortfolio: any[]
    fetchedSipMathLib: any
    fetchedUwpData: any
    tokenPrices: { symbol: string; price: number }[]
  }
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  intrface: {
    canSeePortfolioAreaChart: false,
    canSeePortfolioVolatility: false,
    canSeeTokenVolatilities: false,
  },
  data: {
    portfolioHistogramTickers: [],
    tokenHistogramTickers: [],
    trials: 0,
    portfolioVolatilityData: [],
    priceHistory30D: [],
    allDataPortfolio: [],
    fetchedSipMathLib: undefined,
    fetchedUwpData: undefined,
    tokenPrices: [],
  },
})

const AnalyticsManager: React.FC = ({ children }) => {
  const { activeNetwork } = useNetwork()
  const [portfolioHistogramTickers, setPortfolioHistogramTickers] = useState<string[]>([])
  const [tokenHistogramTickers, setTokenHistogramTickers] = useState<string[]>([])
  const [portfolioVolatilityData, setPortfolioVolatilityData] = useState<number[]>([])
  const [priceHistory30D, setPriceHistory30D] = useState<any[]>([])
  const [allDataPortfolio, setAllDataPortfolio] = useState<any[]>([])
  const [tokenPrices, setTokenPrices] = useState<{ symbol: string; price: number }[]>([])

  const [fetchedUwpData, setFetchedUwpData] = useState<any>(undefined)
  const [fetchedSipMathLib, setFetchedSipMathLib] = useState<any>(undefined)

  const [canSeePortfolioAreaChart, setCanSeePortfolioAreaChart] = useState<boolean>(false)
  const [canSeePortfolioVolatility, setCanSeePortfolioVolatility] = useState<boolean>(false)
  const [canSeeTokenVolatilities, setCanSeeTokenVolatilities] = useState<boolean>(false)

  const TRIALS = 1000

  const validateTokenArrays = useCallback((arrayA: string[], arrayB: string[]): boolean => {
    return arrayA.length === arrayB.length && arrayA.every((value) => arrayB.includes(value))
  }, [])

  const reformatDataForAreaChart = useCallback((json: any): any => {
    if (!json || json.length == 0) return []
    const now = Date.now() / 1000
    const daysCutOffPoint = 30
    const start = now - 60 * 60 * 24 * daysCutOffPoint // filter out data points by time
    const output = []
    const nonZeroBalanceMapping: { [key: string]: boolean } = {}
    let allTokenKeys: string[] = []
    const latestTokenPrices: { symbol: string; price: number }[] = []

    for (let i = 1; i < json.length; ++i) {
      const currData = json[i]
      const timestamp = currData.timestamp
      if (timestamp < start) continue
      const tokens = currData.tokens
      const tokenKeys = Object.keys(tokens)
      allTokenKeys = tokenKeys.map((item) => item.toLowerCase())
      const usdArr = tokenKeys.map((key: string) => {
        const balance = tokens[key].balance - 0
        const price = tokens[key].price - 0
        const usd = balance * price
        if (i === json.length - 1) latestTokenPrices.push({ symbol: key.toLowerCase(), price: price })
        if (usd > 0) nonZeroBalanceMapping[key.toLowerCase()] = true
        return usd
      })
      const newRow: any = {
        timestamp: parseInt(currData.timestamp),
      }
      tokenKeys.forEach((key, i) => {
        newRow[key.toLowerCase()] = usdArr[i]
      })
      const inf = tokenKeys.filter((key) => newRow[key.toLowerCase()] == Infinity).length > 0
      if (!inf) output.push(newRow)
    }

    // sort by timestamp and only add tokens that had non-zero balances
    const adjustedOutput = output
      .sort((a: any, b: any) => a.timestamp - b.timestamp)
      .map((oldRow) => {
        const newerRow: any = { timestamp: oldRow.timestamp }
        Object.keys(nonZeroBalanceMapping).forEach((key) => {
          newerRow[key.toLowerCase()] = oldRow[key.toLowerCase()]
        })
        return newerRow
      })
    return { output: adjustedOutput, allTokenKeys, latestTokenPrices }
  }, [])

  const getPortfolioVolatility = useCallback((weights: number[], simulatedVolatility: any[]): number[] => {
    const result: number[] = Array(TRIALS).fill(0) // fixed array of length 1000 and initialized with zeroes
    for (let i = 0; i < TRIALS; i++) {
      let trialSum = 0
      for (let j = 0; j < simulatedVolatility.length; j++) {
        const ticker = simulatedVolatility[j]
        const volatilityTrials = ticker // array of 1000 trials based on token ticker
        const weight = weights[j] // number less than 1
        const adjustedVolatility = volatilityTrials[i] * weight
        trialSum += adjustedVolatility
      }
      result[i] = trialSum // add to the result array
    }
    return result
  }, [])

  const getWeightsFromBalances = useCallback((balances: number[]): number[] => {
    const sum = balances.reduce((a: number, b: number) => a + b, 0)
    const weights = balances.map((balance) => balance / sum)
    return weights
  }, [])

  const getPortfolioDetailData = useCallback(
    (json: any, simulatedReturns: { [key: string]: number[] }): MassUwpDataPortfolio[] => {
      if (!json || json.length == 0) return []
      const latestData = json[json.length - 1]
      const tokens = latestData.tokens
      const tokenKeys = Object.keys(tokens)
      const tokenDetails = tokenKeys.map((key: string) => {
        const balance = tokens[key].balance - 0
        const price = tokens[key].price - 0
        const usd = balance * price
        const _tokenDetails = {
          symbol: key.toLowerCase(),
          balance: balance,
          price: price,
          usdBalance: usd,
          weight: 0,
          simulation: simulatedReturns[key.toLowerCase()] ?? [],
        }
        return _tokenDetails
      })
      return tokenDetails
    },
    []
  )

  useEffect(() => {
    const init = async () => {
      const analytics = await axios.get('https://stats-cache.solace.fi/native_uwp/all.json')
      const sipMathLib: any = await axios.get(`https://stats-cache.solace.fi/volatility.json`)
      setFetchedUwpData(analytics)
      setFetchedSipMathLib(sipMathLib)
    }
    init()
  }, [])

  useEffect(() => {
    const getData = async () => {
      if (!fetchedUwpData || !fetchedUwpData.data[`${activeNetwork.chainId}`] || !fetchedSipMathLib) {
        setCanSeePortfolioAreaChart(false)
        setCanSeePortfolioVolatility(false)
        setCanSeeTokenVolatilities(false)
        return
      }

      const { output: _priceHistory30D, allTokenKeys, latestTokenPrices } = reformatDataForAreaChart(
        fetchedUwpData.data[`${activeNetwork.chainId}`]
      )

      setTokenPrices(latestTokenPrices)
      setTokenHistogramTickers(fetchedSipMathLib.data.sips.map((item: any) => item.name.toLowerCase()))
      setPortfolioHistogramTickers(allTokenKeys)
      setPriceHistory30D(_priceHistory30D)
      setCanSeePortfolioAreaChart(true)

      const numSips = listSIPs(fetchedSipMathLib.data).map((item) => item.toLowerCase())

      const _simulatedReturns: { [key: string]: number[] } = hydrateLibrary(fetchedSipMathLib.data, TRIALS)

      if (validateTokenArrays(allTokenKeys, numSips)) {
        const allDataPortfolio: MassUwpDataPortfolio[] = getPortfolioDetailData(
          fetchedUwpData.data[`${activeNetwork.chainId}`],
          _simulatedReturns
        )
        const tokenWeights = getWeightsFromBalances(
          allDataPortfolio.map((token: MassUwpDataPortfolio) => token.usdBalance)
        )
        const adjustedPortfolio: MassUwpDataPortfolio[] = allDataPortfolio.map((token: any, i: number) => {
          return {
            ...token,
            weight: tokenWeights[i],
          }
        })

        const _portfolioVolatilityData = getPortfolioVolatility(
          tokenWeights,
          adjustedPortfolio.map((token: MassUwpDataPortfolio) => token.simulation)
        )
        setPortfolioVolatilityData(_portfolioVolatilityData)
        setAllDataPortfolio(adjustedPortfolio)
        setCanSeePortfolioVolatility(true)
        setCanSeeTokenVolatilities(true)
      }
    }
    getData()
  }, [
    getPortfolioDetailData,
    getWeightsFromBalances,
    reformatDataForAreaChart,
    getPortfolioVolatility,
    validateTokenArrays,
    activeNetwork,
    fetchedUwpData,
    fetchedSipMathLib,
  ])

  const value = useMemo(
    () => ({
      intrface: {
        canSeePortfolioAreaChart,
        canSeeTokenVolatilities,
        canSeePortfolioVolatility,
      },
      data: {
        portfolioHistogramTickers,
        tokenHistogramTickers,
        trials: TRIALS,
        portfolioVolatilityData,
        priceHistory30D,
        allDataPortfolio,
        fetchedUwpData,
        fetchedSipMathLib,
        tokenPrices,
      },
    }),
    [
      canSeePortfolioAreaChart,
      portfolioHistogramTickers,
      tokenHistogramTickers,
      portfolioVolatilityData,
      priceHistory30D,
      allDataPortfolio,
      canSeeTokenVolatilities,
      canSeePortfolioVolatility,
      fetchedUwpData,
      fetchedSipMathLib,
      tokenPrices,
    ]
  )
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext(): AnalyticsContextType {
  return useContext(AnalyticsContext)
}

export default AnalyticsManager
