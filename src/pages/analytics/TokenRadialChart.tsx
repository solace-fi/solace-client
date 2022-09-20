import React, { useEffect, useState, useMemo } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useAnalyticsContext } from './AnalyticsContext'
import vegaEmbed from 'vega-embed'
import { useGeneral } from '../../context/GeneralManager'
import { Text } from '../../components/atoms/Typography'
import { StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'

export const TokenRadialChart = () => {
  const { appTheme } = useGeneral()
  const { intrface, data } = useAnalyticsContext()
  const { canSeePortfolioVolatility } = intrface
  const { allDataPortfolio } = data
  const [displayVega, setDisplayVega] = useState(false)

  function fetchVega(dataIn: any, theme: 'light' | 'dark') {
    vegaEmbed('#token-radial-chart', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Portfolio Daily % Price Change', color: theme == 'light' ? 'black' : 'white' },
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
        values: dataIn.map((item: any) => {
          return {
            weight: item.weight,
            symbol: item.symbol,
          }
        }),
      },
      layer: [
        {
          mark: { type: 'arc', innerRadius: 20, stroke: '#fff' },
        },
        {
          mark: { type: 'text', radiusOffset: 10 },
          encoding: {
            text: { field: 'symbol' },
          },
        },
      ],
      encoding: {
        theta: { field: 'weight', type: 'quantitative', stack: true },
        radius: { field: 'weight', scale: { type: 'sqrt', zero: true, rangeMin: 20 } },
        color: { field: 'weight', type: 'nominal', legend: null },
      },
    })
  }

  useEffect(() => {
    setDisplayVega(true) //TODO ???
    fetchVega(allDataPortfolio, appTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataPortfolio])

  return (
    <Flex gap={10}>
      <Flex id="token-radial-chart" widthP={300} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
