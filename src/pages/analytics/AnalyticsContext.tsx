import { hydrateLibrary, listSIPs } from '@solace-fi/hydrate'
import { ZERO } from '@solace-fi/sdk-nightly'
import axios from 'axios'
import { BigNumber } from 'ethers'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MassUwpDataPortfolio } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { FetchedPremiums } from './types/FetchedPremiums'
import { FetchedSipMathLib } from './types/SipMathLib'
import { BlockData, FetchedUWPData } from './types/UWPData'
import { useUwp } from '../../hooks/lock/useUnderwritingHelper'
import { validateTokenArrays } from '../../utils'

export type TimestampedTokenNumberValues = {
  timestamp: number
  [key: string]: number
}
export type ReformattedData = {
  output: TimestampedTokenNumberValues[]
  allTokenKeys: string[]
}

type AnalyticsContextType = {
  intrface: {
    canSeePortfolioAreaChart?: boolean
    canSeePortfolioVolatility?: boolean
    canSeeTokenVolatilities?: boolean
  }
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
    getPortfolioVolatility: (weights: number[], simulatedVolatility: number[][]) => number[]
  }
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  intrface: {
    canSeePortfolioAreaChart: undefined,
    canSeePortfolioVolatility: undefined,
    canSeeTokenVolatilities: undefined,
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
    fetchedPremiums: undefined,
    tokenDetails: [],
    uwpValueUSD: ZERO,
    getPortfolioVolatility: () => [],
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

  const [canSeePortfolioAreaChart, setCanSeePortfolioAreaChart] = useState<boolean | undefined>(undefined)
  const [canSeePortfolioVolatility, setCanSeePortfolioVolatility] = useState<boolean | undefined>(undefined)
  const [canSeeTokenVolatilities, setCanSeeTokenVolatilities] = useState<boolean | undefined>(undefined)

  const TRIALS = 1000

  const reformatDataForAreaChart = useCallback(function reformatDataForAreaChart(
    blockDataArr: BlockData[]
  ): ReformattedData {
    if (!blockDataArr || blockDataArr.length == 0) return { output: [], allTokenKeys: [] }
    const now = Date.now() / 1000
    const daysCutOffPoint = 30
    const start = now - 60 * 60 * 24 * daysCutOffPoint // filter out data points by time
    const output = []
    const nonZeroBalanceMapping: { [key: string]: boolean } = {}
    let allTokenKeys: string[] = []

    for (let i = 1; i < blockDataArr.length; ++i) {
      const currData = blockDataArr[i]
      const timestamp = currData.timestamp
      if (timestamp < start) continue
      const tokens = currData.tokens
      // todo: vwave is taken out for now
      const tokenKeys = Object.keys(tokens).filter((key) => key.toLowerCase() !== 'vwave')
      allTokenKeys = tokenKeys.map((item) => item.toLowerCase())
      const usdArr = tokenKeys.map((key: string) => {
        const balance = Number(tokens[key].balance) - 0
        const price = Number(tokens[key].price) - 0
        const usd = balance * price
        if (usd > 0) nonZeroBalanceMapping[key.toLowerCase()] = true
        return usd
      })
      const newRow: TimestampedTokenNumberValues = {
        timestamp: parseInt(currData.timestamp.toString()),
      }
      tokenKeys.forEach((key, i) => {
        newRow[key.toLowerCase()] = usdArr[i]
      })
      const inf = tokenKeys.filter((key) => newRow[key.toLowerCase()] == Infinity).length > 0
      if (!inf) output.push(newRow)
    }

    // sort by timestamp and only add tokens that had non-zero balances
    const adjustedOutput = output
      .sort((a: TimestampedTokenNumberValues, b: TimestampedTokenNumberValues) => a.timestamp - b.timestamp)
      .map((oldRow) => {
        const newerRow: TimestampedTokenNumberValues = { timestamp: oldRow.timestamp }
        Object.keys(nonZeroBalanceMapping).forEach((key) => {
          newerRow[key.toLowerCase()] = oldRow[key.toLowerCase()]
        })
        return newerRow
      })
    const formattedData = { output: adjustedOutput, allTokenKeys }
    return formattedData
  },
  [])

  const getPortfolioVolatility = useCallback((weights: number[], simulatedVolatility: number[][]): number[] => {
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

  const getPortfolioDetailData = useCallback(
    (json: BlockData[], simulatedReturns: { [key: string]: number[] }, tokenKeys: string[]): MassUwpDataPortfolio[] => {
      if (!json || json.length == 0) return []
      const latestData = json[json.length - 1]
      const tokens = latestData.tokens
      const tokenDetails = tokenKeys.map((key: string) => {
        const balance = Number(tokens[key.toUpperCase()].balance) - 0
        const price = Number(tokens[key.toUpperCase()].price) - 0
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
      if (!fetchedUwpData || !fetchedSipMathLib || !fetchedSipMathLib.sips) {
        setCanSeePortfolioAreaChart(undefined)
        setCanSeePortfolioVolatility(undefined)
        setCanSeeTokenVolatilities(undefined)
        return
      }

      if (!(fetchedUwpData[activeNetwork.chainId.toString()] as BlockData[])) {
        setCanSeePortfolioAreaChart(false)
        setCanSeePortfolioVolatility(false)
        setCanSeeTokenVolatilities(false)
        return
      }

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
          adjustedPortfolio.map((token: MassUwpDataPortfolio) => token.simulation)
        )
        setPortfolioVolatilityData(_portfolioVolatilityData)
        setAllDataPortfolio(adjustedPortfolio)
        setCanSeePortfolioAreaChart(true)
        setCanSeePortfolioVolatility(true)
        setCanSeeTokenVolatilities(true)
      }
    }
    getData()
  }, [
    getPortfolioDetailData,
    reformatDataForAreaChart,
    getPortfolioVolatility,
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
        fetchedPremiums,
        fetchedSipMathLib,
        tokenDetails,
        uwpValueUSD,
        getPortfolioVolatility,
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
      fetchedPremiums,
      tokenDetails,
      uwpValueUSD,
      getPortfolioVolatility,
    ]
  )
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext(): AnalyticsContextType {
  return useContext(AnalyticsContext)
}

export default AnalyticsManager
