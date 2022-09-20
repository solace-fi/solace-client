import React, { useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useAnalyticsContext } from './AnalyticsContext'
// import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { useGeneral } from '../../context/GeneralManager'

export const TokenWeights1 = () => {
  const { width, isMobile } = useWindowDimensions()
  const { intrface, data } = useAnalyticsContext()
  // const { canSeePortfolioAreaChart } = intrface
  const { priceHistory30D, portfolioHistogramTickers } = data
  // const xticks =
  //   priceHistory30D.length > 0
  //     ? calculateMonthlyTicks(priceHistory30D[0].timestamp, priceHistory30D[priceHistory30D.length - 1].timestamp)
  //     : []
  const { appTheme } = useGeneral()
  const { allDataPortfolio } = data
  // const [displayVega, setDisplayVega] = useState(false)

  console.log('priceHistory30D', priceHistory30D)
  const fetchVega = (dataIn: any, theme: 'light' | 'dark') => {
    vegaEmbed('#token-weights-1', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Token Weigths, Last 30 Days', color: theme == 'light' ? 'black' : 'white' },
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
      mark: { type: 'area' },
      encoding: {
        x: {
          timeUnit: 'yearmonthdatehoursminutes',
          field: 'timestamp',
          axis: { domain: false },
        },
        y: {
          aggregate: 'sum',
          field: 'y',
          axis: null,
          stack: 'normalize',
        },
        color: { field: 'ticker', scale: { scheme: 'category20b' } },
        /*         x: {
          timeUnit: 'yearmonthdatehoursminutes',
          field: 'timestamp',
          //   axis: { format: '%Y %M %D' },
        },
        y: {
          aggregate: 'sum',
          field: 'y',
        },
        color: {
          field: 'ticker',
          scale: { scheme: 'category20b' },
        }, */
      },
    })
  }
  useEffect(() => {
    // setDisplayVega(true) //TODO ???
    const reformatedData1: any = []
    // const reformatedData2: any = []
    if (priceHistory30D.length > 0) {
      priceHistory30D.forEach((item) => {
        // unique timestamp
        for (const [key, value] of Object.entries(item)) {
          const temptimestamp = item.timestamp
          let tempticker = ''
          let tempy: any = 0
          if (key !== 'timestamp') {
            tempticker = key
            tempy = value
          }
          reformatedData1.push({ timestamp: temptimestamp, ticker: tempticker, y: tempy })
        }
        // reformatedData2.push(reformatedData1[item])
      })
    }
    console.log('reformatedData1', reformatedData1)
    fetchVega(reformatedData1, appTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataPortfolio])

  // Hmm twice? can we move appTheme up to [tickerSymbol,appTheme] ?
  useEffect(
    () => {
      fetchVega(priceHistory30D, appTheme)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appTheme]
  )

  return (
    <Flex gap={10} col={isMobile}>
      <Flex id="token-weights-1" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
