import React, { useEffect } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useAnalyticsContext } from './AnalyticsContext'
import vegaEmbed from 'vega-embed'
import { useGeneral } from '../../context/GeneralManager'
import { Text } from '../../components/atoms/Typography'
import { StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

export const TokenRadialChart = ({
  chosenWidth,
  chosenHeight,
}: {
  chosenWidth: number
  chosenHeight: number
}): JSX.Element => {
  const { appTheme } = useGeneral()
  const { width } = useWindowDimensions()
  const { data } = useAnalyticsContext()
  const { allDataPortfolio } = data

  function fetchVega(dataIn: any, theme: 'light' | 'dark') {
    vegaEmbed('#token-radial-chart', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Portfolio Daily % Price Change', color: theme == 'light' ? 'black' : 'white' },
      config: {
        style: { cell: { stroke: 'transparent' } },
        axis: { labelColor: theme == 'light' ? 'black' : 'white' },
        font: 'Montserrat',
      },
      background: 'transparent',
      width: 'container',
      height: chosenHeight,
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
      ],
      encoding: {
        theta: { field: 'weight', type: 'quantitative', stack: true },
        radius: { field: 'weight', scale: { type: 'sqrt', zero: true, rangeMin: 20 } },
        color: {
          field: 'symbol',
          type: 'nominal',
          legend: {
            titleColor: theme == 'light' ? 'black' : 'white',
            labelColor: theme == 'light' ? 'black' : 'white',
            title: 'Token Portfolio',
            direction: 'vertical',
          },
          sort: { field: 'weight', order: 'descending' },
        },
        order: { field: 'weight', type: 'quantitative', sort: 'ascending' },
      },
    })
  }

  useEffect(() => {
    fetchVega(allDataPortfolio, appTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataPortfolio, chosenHeight, chosenWidth, appTheme, width])

  return (
    <Flex gap={10}>
      <Flex id="token-radial-chart" widthP={300} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
