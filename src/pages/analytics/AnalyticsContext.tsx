import { hydrateLibrary } from '@solace-fi/hydrate'
import axios from 'axios'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { WrappedTokenToMasterToken } from '@solace-fi/sdk-nightly'

type AnalyticsContextType = {
  acceptedTickers: any[]
  trials: number
  portfolioVolatilityData: number[]
  priceHistory30D: any[]
  sipMathLib: any
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
  const trials = useMemo(() => 1000, [])
  const [portfolioVolatilityData, setPortfolioVolatilityData] = useState<number[]>([])
  const [priceHistory30D, setPriceHistory30D] = useState<any[]>([])
  const [sipMathLib, setSipMathLib] = useState<any>(undefined)
  const [allDataPortfolio, setAllDataPortfolio] = useState<any[]>([])

  useEffect(() => {
    const mountAndHydrate = async () => {
      // Get Price History for Native UWP
      // DANGER we are assuming volatility.json has the exact same tokens as found in UWP
      // TODO: Trigger /volatily metadata.json update as tokens are deposited in uwp

      // 1  a. Get token volatility.json from cache
      //    b. TODO: Get UWP tokens symbols from onchain, use sdk??
      //    c. get token position amounts and their price from all.json cache
      //    d. Simulate each token volatility for 1000 trials
      // 2  Calculate token weights as % of UWP from allData.json
      // 3  Calculate the Portfolio volatility as the sumproduct of the token volatilities
      // 4  Filter and reformat whitelisted token price history
      // 5  Set states

      //// 1 ////
      const sipMathLib: any = await axios.get(`https://stats-cache.solace.fi/volatility.json`)
      function getPortfolioDetailData(json: any): any {
        if (!json || json.length == 0) return []
        /// Just the current/latest info in cache
        const latestData = json[json.length - 1]
        const tokens = latestData.tokens
        const tokenKeys = Object.keys(tokens)

        const simulatedReturns: any = hydrateLibrary(sipMathLib.data.data, trials)
        Object.keys(simulatedReturns).map((key) => {
          _acceptedTickers.push(key)
        })
        const tokenDetails = tokenKeys
          .filter(
            (key) =>
              _acceptedTickers.includes(key.toLowerCase()) ||
              _acceptedTickers.includes(simulatedReturns[key.toLowerCase()])
          )
          .map((key: string) => {
            const symbol = key.toLowerCase()
            const balance = tokens[key].balance - 0
            const price = tokens[key].price - 0
            const usd = balance * price
            const tokenDetails = {
              symbol: symbol,
              balance: balance,
              price: price,
              simulation: simulatedReturns[symbol],
            }
            return tokenDetails
          })
        return tokenDetails
      }
      const _acceptedTickers: any[] = []
      const analytics = await axios.get('https://stats-cache.solace.fi/native_uwp/all.json')
      const allDataPortfolio = getPortfolioDetailData(analytics.data['5'])

      //// 2 ////
      function getWeightsFromBalances(balances: number[]): number[] {
        const sum = balances.reduce((a: number, b: number) => a + b, 0)
        const weights = balances.map((balance) => balance / sum)
        return weights
      }
      const currentWeights = getWeightsFromBalances(allDataPortfolio.map((token: { balance: any }) => token.balance))
      // TODO Check that positions are aligned from weights to allDataPortfolio
      allDataPortfolio.map((token: { weight: any }, index: number) => (token.weight = currentWeights[index]))

      //// 3 //// Cacluate sumProduct for portfolio using weights
      const portfolioVolatilityData = getPortfolioVolatility(
        currentWeights,
        allDataPortfolio.map((token: { simulation: any }) => token.simulation)
      )
      setPortfolioVolatilityData(portfolioVolatilityData)
      function getPortfolioVolatility(weights: number[], volatility: any): any {
        const result: number[] = Array(trials).fill(0) // fixed array of length 1000 and initialized with zeroes
        for (let i = 0; i < trials; i++) {
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
      }

      //// 4 ////
      function reformatData(json: any): any {
        if (!json || json.length == 0) return []
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
          _acceptedTickers.forEach((key, i) => {
            newRow[key] = usdArr[i]
          })
          const inf = _acceptedTickers.filter((key) => newRow[key] == Infinity).length > 0
          if (!inf) output.push(newRow)
        }
        output.sort((a: any, b: any) => a.timestamp - b.timestamp)
        return output
      }
      const priceHistory30D = reformatData(analytics.data['5'])

      //// 5 ////
      setPriceHistory30D(priceHistory30D) // TODO: Consider putting into allDataPortfolio
      setAcceptedTickers(_acceptedTickers) // TODO: Consider putting into allDataPortfolio
      setAllDataPortfolio(allDataPortfolio)
      setSipMathLib(sipMathLib.data)
    }
    mountAndHydrate()
  }, [])

  const value = useMemo(
    () => ({
      acceptedTickers,
      trials,
      portfolioVolatilityData,
      priceHistory30D,
      sipMathLib,
      allDataPortfolio,
    }),
    [acceptedTickers, trials, portfolioVolatilityData, priceHistory30D, sipMathLib, allDataPortfolio]
  )
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext(): AnalyticsContextType {
  return useContext(AnalyticsContext)
}

export default AnalyticsManager
function simulatedReturns(simulatedReturns: any) {
  throw new Error('Function not implemented.')
}
