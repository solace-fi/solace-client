import React, { useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useAnalyticsContext } from './AnalyticsContext'
import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { useGeneral } from '../../context/GeneralManager'
import { Layout } from 'react-grid-layout'

export const PortfolioAreaChartVega = ({
  chosenWidth,
  chosenHeight,
}: {
  chosenWidth: number
  chosenHeight: number
}) => {
  const { data } = useAnalyticsContext()
  const { priceHistory30D } = data
  const { appTheme } = useGeneral()
  const { allDataPortfolio } = data

  const reformattedData = useMemo(() => {
    const res: any = []
    if (priceHistory30D.length > 0) {
      priceHistory30D.forEach((item) => {
        // unique timestamp
        for (const [key, value] of Object.entries(item)) {
          const temptimestamp = Number(item.timestamp * 1000)
          let tempticker = ''
          let tempy: any = 0
          if (key !== 'timestamp') {
            tempticker = key
            tempy = value
          }
          if (tempticker !== '') {
            res.push({ timestamp: temptimestamp, ticker: tempticker.toUpperCase(), y: tempy })
          }
        }
      })
    }
    return res
  }, [priceHistory30D])

  const fetchVega = (dataIn: any, theme: 'light' | 'dark') => {
    vegaEmbed('#area-chart-2', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Portfolio Value, Last 30 Days', color: theme == 'light' ? 'black' : 'white' },
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
      data: { values: dataIn },
      mark: { type: 'area', tooltip: true },
      encoding: {
        x: {
          timeUnit: 'yearmonthdatehoursminutes',
          field: 'timestamp',
          title: 'Date',
          axis: { format: '%Y-%m-%d', title: '', grid: false, tickCount: 6, labelAngle: 0 },
        },
        y: {
          aggregate: 'sum',
          field: 'y',
          axis: {
            format: '$,.0f',
            title: '',
            // title: 'Portfolio Value',
            titleColor: theme == 'light' ? 'black' : 'white',
            grid: false,
          },
        },
        color: {
          field: 'ticker',
          scale: { scheme: 'category20b' },
          legend: {
            titleColor: theme == 'light' ? 'black' : 'white',
            labelColor: theme == 'light' ? 'black' : 'white',
            title: 'Token Portfolio',
            orient: chosenWidth < 3 ? 'bottom' : 'right',
            direction: 'vertical',
          },
        },
      },
    })
  }
  useEffect(() => {
    fetchVega(reformattedData, appTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataPortfolio, appTheme, chosenHeight, chosenWidth, reformattedData])

  return (
    <Flex>
      <Flex id="area-chart-2" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
