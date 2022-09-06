import { hydrateLibrary } from '@solace-fi/hydrate'
import axios from 'axios'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { WrappedTokenToMasterToken } from '@solace-fi/sdk-nightly'

type AnalyticsContextType = {
  acceptedTickers: string[]
  trials: number
  portfolioVolatilityData: number[]
  priceHistory30D: any[]
  sipMathLib?: any
  allDataPortfolio: any[]
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  acceptedTickers: [],
  trials: 0,
  portfolioVolatilityData: [],
  priceHistory30D: [],
  sipMathLib: undefined,
  allDataPortfolio: [],
})

const AnalyticsManager: React.FC = ({ children }) => {
  const [acceptedTickers, setAcceptedTickers] = useState<any[]>([])
  const [portfolioVolatilityData, setPortfolioVolatilityData] = useState<number[]>([])
  const [priceHistory30D, setPriceHistory30D] = useState<any[]>([])
  const [sipMathLib, setSipMathLib] = useState<any>(undefined)
  const [allDataPortfolio, setAllDataPortfolio] = useState<any[]>([])
  const [simulatedReturns, setSimulatedReturns] = useState<any>(undefined)

  const TRIALS = 1000

  const reformatDataForAreaChart = useCallback(
    (json: any): any => {
      if (!json || json.length == 0 || acceptedTickers.length == 0) return []
      const now = Date.now() / 1000
      const start = now - 60 * 60 * 24 * 90 // filter out data points > 3 months ago
      const output = []
      for (let i = 1; i < json.length; ++i) {
        const currData = json[i]
        const timestamp = currData.timestamp
        if (timestamp < start) continue
        const tokens = currData.tokens
        const tokenKeys = Object.keys(tokens)
        const usdArr = tokenKeys.map((key: string) => {
          const balance = tokens[key].balance - 0
          const price = tokens[key].price - 0
          const usd = balance * price
          return usd
        })
        const newRow: any = {
          timestamp: parseInt(currData.timestamp),
        }
        acceptedTickers.forEach((key, i) => {
          newRow[key] = usdArr[i]
        })
        const inf = acceptedTickers.filter((key) => newRow[key] == Infinity).length > 0
        if (!inf) output.push(newRow)
      }
      output.sort((a: any, b: any) => a.timestamp - b.timestamp)
      return output
    },
    [acceptedTickers]
  )

  const getPortfolioVolatility = useCallback((weights: number[], volatility: any[]) => {
    const result: number[] = Array(TRIALS).fill(0) // fixed array of length 1000 and initialized with zeroes
    for (let i = 0; i < TRIALS; i++) {
      let trialSum = 0
      for (let j = 0; j < volatility.length; j++) {
        const ticker = volatility[j]
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
    (json: any): any => {
      if (!json || json.length == 0 || !simulatedReturns || acceptedTickers.length == 0) return []
      const latestData = json[json.length - 1]
      const tokens = latestData.tokens
      const tokenKeys = Object.keys(tokens)
      const tokenDetails = tokenKeys
        .filter(
          (key) =>
            acceptedTickers.includes(key.toLowerCase()) ||
            acceptedTickers.includes(simulatedReturns[key.toLowerCase()]) ||
            acceptedTickers.includes(WrappedTokenToMasterToken[key.toLowerCase()])
        )
        .map((key: string) => {
          const symbol = key.toLowerCase()
          const balance = tokens[key].balance - 0
          const price = tokens[key].price - 0
          const usd = balance * price
          const _tokenDetails = {
            symbol: symbol,
            balance: balance,
            price: price,
            usdBalance: usd,
            simulation: simulatedReturns[symbol],
            weight: 0,
          }
          return _tokenDetails
        })
      return tokenDetails
    },
    [simulatedReturns, acceptedTickers]
  )

  // useEffect(() => {
  //   const mountAndHydrate = async () => {
  //     // Get Price History for Native UWP
  //     // DANGER we are assuming volatility.json has the exact same tokens as found in UWP
  //     // TODO: Trigger /volatily metadata.json update as tokens are deposited in uwp

  //     // 1  a. Get token volatility.json from cache
  //     //    b. TODO: Get UWP tokens symbols from onchain, use sdk??
  //     //    c. get token position amounts and their price from all.json cache
  //     //    d. Simulate each token volatility for 1000 trials
  //     // 2  Calculate token weights as % of UWP from allData.json
  //     // 3  Calculate the Portfolio volatility as the sumproduct of the token volatilities
  //     // 4  Filter and reformat whitelisted token price history
  //     // 5  Set states

  //     //// 1 ////

  //     //// 2 ////

  //     // TODO Check that positions are aligned from weights to allDataPortfolio

  //     //// 3 //// Cacluate sumProduct for portfolio using weights

  //     //// 4 ////

  //     //// 5 ////
  //     setPriceHistory30D(priceHistory30D) // TODO: Consider putting into allDataPortfolio
  //     setAcceptedTickers(_acceptedTickers) // TODO: Consider putting into allDataPortfolio
  //     setAllDataPortfolio(allDataPortfolio)
  //   }
  //   mountAndHydrate()
  // }, [trials])

  useEffect(() => {
    const hydrate = async () => {
      const sipMathLib: any = await axios.get(`https://stats-cache.solace.fi/volatility.json`)
      const _simulatedReturns: any = hydrateLibrary(sipMathLib.data.data, TRIALS)
      const _acceptedTickers: string[] = []
      Object.keys(_simulatedReturns).map((key) => {
        _acceptedTickers.push(key)
      })
      setSipMathLib(sipMathLib.data)
      setAcceptedTickers(_acceptedTickers)
      setSimulatedReturns(_simulatedReturns)
    }
    hydrate()
  }, [])

  useEffect(() => {
    const getData = async () => {
      const analytics = await axios.get('https://stats-cache.solace.fi/native_uwp/all.json')
      const allDataPortfolio = getPortfolioDetailData(analytics.data['5']) // todo: 5 is gorli chainid
      const tokenWeights = getWeightsFromBalances(allDataPortfolio.map((token: any) => token.usdBalance))
      allDataPortfolio.map((token: { weight: number }, index: number) => (token.weight = tokenWeights[index]))
      const _portfolioVolatilityData = getPortfolioVolatility(
        tokenWeights,
        allDataPortfolio.map((token: any) => token.simulation)
      )
      const _priceHistory30D = reformatDataForAreaChart(analytics.data['5'])
      setPriceHistory30D(_priceHistory30D)
      setPortfolioVolatilityData(_portfolioVolatilityData)
      setAllDataPortfolio(allDataPortfolio)
    }
    getData()
  }, [getPortfolioDetailData, getWeightsFromBalances, getPortfolioVolatility, reformatDataForAreaChart])

  const value = useMemo(
    () => ({
      acceptedTickers,
      trials: TRIALS,
      portfolioVolatilityData,
      priceHistory30D,
      sipMathLib,
      allDataPortfolio,
    }),
    [acceptedTickers, portfolioVolatilityData, priceHistory30D, sipMathLib, allDataPortfolio]
  )
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext(): AnalyticsContextType {
  return useContext(AnalyticsContext)
}

export default AnalyticsManager
