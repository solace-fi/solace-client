import React, { useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useAnalyticsContext } from './AnalyticsContext'
import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { useGeneral } from '../../context/GeneralManager'

export const PortfolioAreaChart2 = () => {
  const { width, isMobile } = useWindowDimensions()
  const { intrface, data } = useAnalyticsContext()
  const { canSeePortfolioAreaChart } = intrface
  const { priceHistory30D, portfolioHistogramTickers } = data
  const xticks =
    priceHistory30D.length > 0
      ? calculateMonthlyTicks(priceHistory30D[0].timestamp, priceHistory30D[priceHistory30D.length - 1].timestamp)
      : []
  const { appTheme } = useGeneral()
  const { allDataPortfolio } = data
  const [displayVega, setDisplayVega] = useState(false)

  // useeffect and log if we have the price history
  // useEffect(() => {
  //   console.log('priceHistory30D', priceHistory30D)
  // }, [priceHistory30D])

  // console.log('priceHistory30D', priceHistory30D)
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
      height: 300,
      autosize: {
        type: 'fit',
        contains: 'padding',
        resize: true,
      },
      data: { values: dataIn },
      mark: { type: 'area', tooltip: true },
      encoding: {
        x: {
          timeUnit: 'yearmonthdate',
          field: 'timestamp',
          title: 'Date',
          axis: { title: '', grid: false },
          //   axis: { format: '%Y %M %D' },
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
          },
        },
      },
    })
  }
  useEffect(() => {
    setDisplayVega(true) //TODO ???
    const reformatedData1: any = []
    // const reformatedData2: any = []
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
            reformatedData1.push({ timestamp: temptimestamp, ticker: tempticker.toUpperCase(), y: tempy })
          }
        }
        // reformatedData2.push(reformatedData1[item])
      })
    }
    console.log({ reformatedData1 })
    fetchVega(reformatedData1, appTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataPortfolio, appTheme])

  // Hmm twice? can we move appTheme up to [tickerSymbol,appTheme] ?
  // useEffect(
  //   () => {
  //     fetchVega(priceHistory30D, appTheme)
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [appTheme]
  // )

  return (
    <Flex gap={10} col={isMobile}>
      <Flex id="area-chart-2" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
