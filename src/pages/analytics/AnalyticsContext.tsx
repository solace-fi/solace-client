import { hydrateLibrary, listSIPs } from '@solace-fi/hydrate'
import axios from 'axios'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MassUwpDataPortfolio } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'

type AnalyticsContextType = {
  intrface: {
    canSeePortfolioVolatility: boolean
    canSeeTokenVolatilities: boolean
  }
  data: {
    portfolioHistogramTickers: string[]
    tokenHistogramTickers: string[]
    trials: number
    portfolioVolatilityData: number[]
    priceHistory30D: any[]
    filteredSipMathLib?: any
    allDataPortfolio: any[]
  }
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  intrface: {
    canSeePortfolioVolatility: false,
    canSeeTokenVolatilities: false,
  },
  data: {
    portfolioHistogramTickers: [],
    tokenHistogramTickers: [],
    trials: 0,
    portfolioVolatilityData: [],
    priceHistory30D: [],
    filteredSipMathLib: undefined,
    allDataPortfolio: [],
  },
})

const AnalyticsManager: React.FC = ({ children }) => {
  const { activeNetwork } = useNetwork()
  const [portfolioHistogramTickers, setPortfolioHistogramTickers] = useState<string[]>([])
  const [tokenHistogramTickers, setTokenHistogramTickers] = useState<string[]>([])
  const [portfolioVolatilityData, setPortfolioVolatilityData] = useState<number[]>([])
  const [priceHistory30D, setPriceHistory30D] = useState<any[]>([])
  const [filteredSipMathLib, setFilteredSipMathLib] = useState<any>(undefined)
  const [allDataPortfolio, setAllDataPortfolio] = useState<any[]>([])

  const [fetchedUwpData, setFetchedUwpData] = useState<any>(undefined)
  const [fetchedSipMathLib, setFetchedSipMathLib] = useState<any>(undefined)

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
      output.push(newRow)
    }

    // sort by timestamp
    output.sort((a: any, b: any) => a.timestamp - b.timestamp)

    //only add tokens that had non-zero balances
    const adjustedOutput = output.map((row) => {
      const newRow: any = { timestamp: row.timestamp }
      Object.keys(nonZeroBalanceMapping).forEach((key) => {
        newRow[key.toLowerCase()] = row[key.toUpperCase()]
      })
      return newRow
    })
    return { output: adjustedOutput, nonZeroBalanceMapping }
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
    (
      json: any,
      nonZeroBalanceMapping: { [key: string]: boolean },
      simulatedReturns: { [key: string]: number[] }
    ): MassUwpDataPortfolio[] => {
      if (!json || json.length == 0) return []
      const latestData = json[json.length - 1]
      const tokens = latestData.tokens
      const tokenKeys = Object.keys(tokens)
      const tokenDetails = tokenKeys
        .filter((key) => nonZeroBalanceMapping[key.toLowerCase()])
        .map((key: string) => {
          const symbol = key.toLowerCase()
          const balance = tokens[symbol].balance - 0
          const price = tokens[symbol].price - 0
          const usd = balance * price
          const _tokenDetails = {
            symbol: symbol,
            balance: balance,
            price: price,
            usdBalance: usd,
            weight: 0,
            simulation: simulatedReturns[symbol] ?? [],
          }
          return _tokenDetails
        })
      return tokenDetails
    },
    []
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
      if (!fetchedUwpData || !fetchedUwpData.data[`${activeNetwork.chainId}`] || !fetchedSipMathLib) return

      const { output: _priceHistory30D, nonZeroBalanceMapping } = reformatDataForAreaChart(
        fetchedUwpData.data[`${activeNetwork.chainId}`]
      )

      // all tokens that have non-zero balances
      const whiteListedPortfolioNonZeroTokens = Object.keys(nonZeroBalanceMapping).map((item) => item.toLowerCase())

      // sipmathlib filtered to only include tokens that have non-zero balances
      const filteredSipMathLib = {
        ...fetchedSipMathLib,
        data: {
          ...fetchedSipMathLib.data,
          data: {
            ...fetchedSipMathLib.data.data,
            sips: fetchedSipMathLib.data.data.sips.filter((sip: any) =>
              whiteListedPortfolioNonZeroTokens.includes(sip.name.toLowerCase())
            ),
          },
        },
      }
      const numSips = listSIPs(filteredSipMathLib.data.data).map((item) => item.toLowerCase())

      // if number of tokens with non-zero balances equals the number of sips, hydrate and get details, finally enable histogram charts
      if (validateTokenArrays(whiteListedPortfolioNonZeroTokens, numSips)) {
        const _simulatedReturns: any = hydrateLibrary(filteredSipMathLib.data.data, TRIALS)
        const allDataPortfolio: MassUwpDataPortfolio[] = getPortfolioDetailData(
          fetchedUwpData.data[`${activeNetwork.chainId}`],
          nonZeroBalanceMapping,
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
      setTokenHistogramTickers(fetchedSipMathLib.data.data.sips.map((item: any) => item.name.toLowerCase()))
      setFilteredSipMathLib(filteredSipMathLib.data)
      setPortfolioHistogramTickers(whiteListedPortfolioNonZeroTokens)
      setPriceHistory30D(_priceHistory30D)
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
        canSeeTokenVolatilities,
        canSeePortfolioVolatility,
      },
      data: {
        portfolioHistogramTickers,
        tokenHistogramTickers,
        trials: TRIALS,
        portfolioVolatilityData,
        priceHistory30D,
        filteredSipMathLib,
        allDataPortfolio,
      },
    }),
    [
      portfolioHistogramTickers,
      tokenHistogramTickers,
      portfolioVolatilityData,
      priceHistory30D,
      filteredSipMathLib,
      allDataPortfolio,
      canSeeTokenVolatilities,
      canSeePortfolioVolatility,
    ]
  )
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext(): AnalyticsContextType {
  return useContext(AnalyticsContext)
}

export default AnalyticsManager
