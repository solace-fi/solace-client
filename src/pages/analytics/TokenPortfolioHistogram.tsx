import React, { useEffect } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useAnalyticsContext } from './AnalyticsContext'
import vegaEmbed from 'vega-embed'
import { useGeneral } from '../../context/GeneralManager'

export const TokenPortfolioHistogram = () => {
  const { appTheme } = useGeneral()
  const { portfolioVolatilityData } = useAnalyticsContext()

  function fetchVega(dataIn: any, theme: 'light' | 'dark', varBar: number) {
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
            x: (item - 1) * 100,
            var: (varBar - 1) * 100,
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
    if (portfolioVolatilityData.length == 0) return
    const quantile = (arr: number[], q: number) => {
      // const sorted = asc(arr); // CAUTION assumed array is sorted
      const sorted = arr
      const pos = (sorted.length - 1) * q
      const base = Math.floor(pos)
      const rest = pos - base
      if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base])
      } else {
        return sorted[base]
      }
    }
    const varBar = quantile(portfolioVolatilityData.sort(), 0.01)
    console.log('varBar', varBar) // VaR should be a slider
    fetchVega(portfolioVolatilityData, appTheme, varBar)
  }, [portfolioVolatilityData, appTheme])

  return <Flex id="vis2" />
}
