import { listSIPs, hydrateLibrary } from '@solace-fi/hydrate'
import { useEffect, useMemo, useState } from 'react'
import { MassUwpDataPortfolio } from '../../constants/types'
import { getWeightsFromBalances, TimestampedTokenNumberValues } from '../../pages/analytics/AnalyticsContext'
import { FetchedPremiums } from '../../pages/analytics/types/FetchedPremiums'
import { FetchedSipMathLib } from '../../pages/analytics/types/SipMathLib'
import { BlockData, FetchedUWPData } from '../../pages/analytics/types/UWPData'
import { getPortfolioDetailData } from '../../pages/analytics/utils/getPortfolioDetailData'
import { getPortfolioVolatility } from '../../pages/analytics/utils/getPortfolioVolatility'
import { reformatDataForAreaChart } from '../../pages/analytics/utils/reformatDataForAreaChart'
import { validateTokenArrays } from '../../utils'

export const useAnalyticsData = (
  chainId: number,
  trials: number,
  fetchedUwpData?: FetchedUWPData,
  fetchedSipMathLib?: FetchedSipMathLib,
  fetchedPremiums?: FetchedPremiums
) => {
  const [tokenHistogramTickers, setTokenHistogramTickers] = useState<string[]>([])
  const [portfolioVolatilityData, setPortfolioVolatilityData] = useState<number[]>([])
  const [priceHistory30D, setPriceHistory30D] = useState<TimestampedTokenNumberValues[]>([])
  const [allDataPortfolio, setAllDataPortfolio] = useState<MassUwpDataPortfolio[]>([])
  const [tokenDetails, setTokenDetails] = useState<{ symbol: string; price: number; weight: number }[]>([])

  useEffect(() => {
    const getData = async () => {
      if (!fetchedUwpData || !fetchedSipMathLib || !fetchedSipMathLib.sips) return
      if (!(fetchedUwpData[chainId.toString()] as BlockData[])) return

      // for vol cumm, and vol histogram
      setTokenHistogramTickers(fetchedSipMathLib.sips.map((item) => item.name.toLowerCase()))
      const { output: _priceHistory30D, allTokenKeys } = reformatDataForAreaChart(fetchedUwpData[`${chainId}`])

      // for portfolio area chart vega
      setPriceHistory30D(_priceHistory30D)

      const numSips = listSIPs(fetchedSipMathLib).map((item) => item.toLowerCase())

      const _simulatedReturns: { [key: string]: number[] } = hydrateLibrary(fetchedSipMathLib, trials)

      if (validateTokenArrays(allTokenKeys, numSips)) {
        const allDataPortfolio: MassUwpDataPortfolio[] = getPortfolioDetailData(
          fetchedUwpData[`${chainId}`],
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
        }) // for token table
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
          trials
        )
        // for tokenportfolio histogram
        setPortfolioVolatilityData(_portfolioVolatilityData)
        // for tokenportfolio histogram, vol cumm, vol histogram, and radial chart
        setAllDataPortfolio(adjustedPortfolio)
      }
    }
    getData()
  }, [fetchedUwpData, fetchedSipMathLib, chainId, trials])

  return {
    tokenHistogramTickers,
    portfolioVolatilityData,
    priceHistory30D,
    allDataPortfolio,
    tokenDetails,
  }
}
