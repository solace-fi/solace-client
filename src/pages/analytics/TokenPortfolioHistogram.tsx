import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useAnalyticsContext } from './AnalyticsContext'
import vegaEmbed from 'vega-embed'
import { useGeneral } from '../../context/GeneralManager'
import { WrappedTokenToMasterToken } from '@solace-fi/sdk-nightly'

export const TokenPortfolioHistogram = () => {
  const { appTheme } = useGeneral()
  const { nativeUwpHistoryData: data, hydratedVolatilityData, acceptedTickers, trials } = useAnalyticsContext()

  const tokenUsdBalances = useMemo(() => getBalancesFromData(data), [data])
  const tokenWeights = useMemo(() => getWeightsFromBalances(tokenUsdBalances), [tokenUsdBalances])

  const [adjustedVolatilityData, setAdjustedVolatilityData] = useState<number[]>([])

  function getBalancesFromData(json: any): any {
    if (!json || json.length == 0) return []
    const latestData = json[json.length - 1]
    const tokens = latestData.tokens
    const tokenKeys = Object.keys(tokens)
    const usdArr = tokenKeys
      .filter(
        (key) =>
          acceptedTickers.includes(key.toLowerCase()) ||
          acceptedTickers.includes(WrappedTokenToMasterToken[key.toLowerCase()])
      )
      .map((key: string) => {
        const balance = tokens[key].balance - 0
        const price = tokens[key].price - 0
        const usd = balance * price
        return usd
      })
    return usdArr
  }

  function getWeightsFromBalances(balances: number[]): number[] {
    const sum = balances.reduce((a: number, b: number) => a + b, 0)
    const weights = balances.map((balance) => balance / sum)
    return weights
  }

  const adjustHydratedData = useCallback(() => {
    const result: number[] = Array(trials).fill(0) // fixed array of length 1000 and initialized with zeroes
    for (let i = 0; i < trials; i++) {
      let trialSum = 0
      for (let j = 0; j < acceptedTickers.length; j++) {
        const ticker = acceptedTickers[j]
        const volatilityTrials = hydratedVolatilityData[ticker] // array of 1000 trials based on token ticker
        const weight = tokenWeights[j] // number less than 1
        const adjustedVolatility = volatilityTrials[i] * weight
        trialSum += adjustedVolatility
      }
      result[i] = trialSum // add to the result array
    }
    setAdjustedVolatilityData(result)
  }, [acceptedTickers, hydratedVolatilityData, tokenWeights, trials])

  function fetchVega(dataIn: any, theme: 'light' | 'dark') {
    vegaEmbed('#vis2', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Portfolio Volatility', color: theme == 'light' ? 'black' : 'white' },
      config: {
        style: { cell: { stroke: 'transparent' } },
        axis: { labelColor: theme == 'light' ? 'black' : 'white' },
      },
      background: 'transparent',
      width: 'container',
      height: 300,
      autosize: {
        type: 'fit',
        contains: 'padding',
        resize: true,
      },
      data: {
        name: 'table',
        values: dataIn.map((item: number) => {
          return {
            x: item,
            var: 0.88,
          }
        }),
      },
      layer: [
        {
          transform: [
            { bin: true, field: 'x', as: 'bin_Range' },
            {
              aggregate: [{ op: 'count', as: 'Count' }],
              groupby: ['bin_Range', 'bin_Range_end'],
            },
            {
              joinaggregate: [{ op: 'sum', field: 'Count', as: 'TotalCount' }],
            },
            { calculate: 'datum.Count/datum.TotalCount', as: 'PercentOfTotal' },
          ],
          mark: { type: 'bar', tooltip: false, line: { color: 'darkgreen' } },
          encoding: {
            x: {
              field: 'bin_Range',
              bin: { binned: true },
              title: '',
            },
            x2: { field: 'bin_Range_end' },
            y: {
              axis: {
                title: 'Relative Frequency',
                titleColor: theme == 'light' ? 'black' : 'white',
                format: '.1~%',
              },
              field: 'PercentOfTotal',
              type: 'quantitative',
            },
            color: { value: '#5F5DF9' },
          },
        },
        {
          mark: 'rule',
          encoding: {
            x: { aggregate: 'mean', field: 'var' },
            color: { value: '#F04D42' },
            size: { value: 3 },
          },
        },
      ],
    })
  }

  useEffect(() => {
    if (!hydratedVolatilityData || acceptedTickers.length == 0 || tokenWeights.length == 0) return
    adjustHydratedData()
  }, [adjustHydratedData, acceptedTickers, hydratedVolatilityData, tokenWeights])

  useEffect(() => {
    if (adjustedVolatilityData.length == 0) return
    fetchVega(adjustedVolatilityData, appTheme)
  }, [adjustedVolatilityData, appTheme])

  return <Flex id="vis2" />
}
