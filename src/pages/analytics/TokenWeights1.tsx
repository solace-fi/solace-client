import React, { useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { getWeightsFromBalances, useAnalyticsContext } from './AnalyticsContext'
// import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { useGeneral } from '../../context/GeneralManager'
import { TokenSelectionModal } from '../../components/organisms/TokenSelectionModal'
import { UWP_ADDRESS } from '@solace-fi/sdk-nightly'
import sampleWeightData from './sampleWeightData'
const log = function <T>(v: T): T {
  return console.log(v), v
}

type Weight = { [key: string]: number }
type WeightsAndDate = {
  timestamp: number
  weights: Weight[]
}

type WeightsAndDates = WeightsAndDate[]

/******** provisional repaste for copilot to know what it's working with */
// interface FetchedUWPData {
//   [key: string]: BlockData[]
// }
// interface BlockData {
//   blockNumber: number
//   timestamp: number
//   timestring: string
//   tokens: { [key: string]: Token }
//   pool?: Pool
// }
// interface Pool {
//   supply: string
//   valuePerShare: string
// }
// interface Token {
//   balance: string
//   price: string
// }

export const TokenWeights1 = () => {
  const { width, isMobile } = useWindowDimensions()
  const { intrface, data } = useAnalyticsContext()
  const { fetchedUwpData } = data
  const [weightsAndDates, setWeightsAndDates] = useState<WeightsAndDates>([])
  // TODO: GET CURRENT CHAIN ID AND ONLY DISPLAY / PROCESS THIS ONE
  const _weightsAndDates = fetchedUwpData?.['5']?.map((uwp) => {
    // for each item, calculate and return { timestamp, weights: {tokenName: weight, tokenName: weight} }
    // uwp is FetchUWPData
    // getWeightsFromBalances takes number[]
    const tokens = Object.values(uwp.tokens)
    const balances = tokens.map((t) => parseFloat(t.balance))
    const weightsFromBalances = getWeightsFromBalances(balances)
    const tokenNames = Object.keys(uwp.tokens)
    const weightsAndNames = tokenNames.map((name, i) => ({ [name]: weightsFromBalances[i] }))
    return { timestamp: uwp.timestamp, weights: weightsAndNames }
  })
  useEffect(() => {
    _weightsAndDates && setWeightsAndDates(_weightsAndDates)
  }, [fetchedUwpData])

  // const { canSeePortfolioAreaChart } = intrface
  // const xticks =
  //   priceHistory30D.length > 0
  //     ? calculateMonthlyTicks(priceHistory30D[0].timestamp, priceHistory30D[priceHistory30D.length - 1].timestamp)
  //     : []
  const { appTheme } = useGeneral()
  // const { allDataPortfolio } = data
  // const [displayVega, setDisplayVega] = useState(false)

  // console.log('tokenDetails', tokenDetails)

  /*
failed schema attempt:

{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "title": { "text": "Token Weigths, Last 30 Days", "color": "black" },
  "config": {
    "style": { "cell": { "stroke": "transparent" } },
    "axis": { "labelColor": "black" },
    "font": "Montserrat"
  },
  "background": "transparent",
  "width": "container",
  "height": 300,
  "autosize": {
    "type": "fit",
    "contains": "padding",
    "resize": true
  },
  "data": { "url": "https://gist.githubusercontent.com/dredshep/52212776b94e3b40e26750a5ddf7bfd8/raw/66383a0e802e3189a7682c159ad5c2182d49eb96/tokenWeights.json" },
  "mark": { "type": "area" },
  "encoding": {
    "x": {
      "timeUnit": "yearmonthdate",
      "field": "timestamp",
      "axis": { "domain": false },
      "title": null
    },
    "y": {
      "aggregate": "sum",
      "field": "weight",
      "axis": null,
      "stack": "normalize",
      "title": "% Weight"
    },
    "color": { "field": "ticker", "scale": { "scheme": "category20b" } }
  }
}

*/

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
      // data: { values: { dataIn } },
      data: { values: sampleWeightData },
      mark: { type: 'area' },
      encoding: {
        x: {
          timeUnit: 'yearmonthdate',
          field: 'timestamp',
          axis: { domain: false },
          title: null,
        },
        y: {
          aggregate: 'sum',
          field: 'weight',
          axis: null,
          stack: 'normalize',
          title: '% Weight',
        },
        color: { field: 'ticker', scale: { scheme: 'category20b' } },
        /*         x: {
          timeUnit: 'yearmonthdate',
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
    const vegaStylizedWeightsAndDates = weightsAndDates.map((wad) => {
      const { timestamp, weights } = wad
      const vegaStylizedWeights = weights.map((w) => {
        const ticker = Object.keys(w)[0]
        const weight = w[ticker]
        return { ticker, y: weight, timestamp: timestamp * 1000 }
      })
      return vegaStylizedWeights
    })
    console.log('vegaStylizedWeightsAndDates', vegaStylizedWeightsAndDates)
    fetchVega(vegaStylizedWeightsAndDates, appTheme)
  }, [fetchedUwpData, appTheme])

  //   // const reformatedData2: any = []
  //   if (weightsAndDates.length > 0) {
  //     weightsAndDates.forEach((wad) => {
  //       wad.weights.forEach((w) => {
  //         const ticker = Object.keys(w)[0]
  //         const weight = Object.values(w)[0]
  //         vegaStylizedWeightsAndDates.push({ timestamp: wad.timestamp * 1000, y: weight, ticker })
  //       })
  //     })
  //     console.log({ vegaStylizedWeightsAndDates })
  //     fetchVega(vegaStylizedWeightsAndDates, appTheme)
  //   }
  //   // if (tokenDetails.length > 0) {
  //   //   tokenDetails.forEach((item) => {
  //   //     // unique timestamp
  //   //     for (const [key, value] of Object.entries(item)) {
  //   //       const temptimestamp = item.timestamp
  //   //       let tempticker = ''
  //   //       let tempy: any = 0
  //   //       if (key !== 'timestamp') {
  //   //         tempticker = key
  //   //         tempy = value
  //   //       }
  //   //       vegaStylizedWeightsAndDates.push({ timestamp: Number(temptimestamp) * 1000, ticker: tempticker, y: tempy })
  //   //     }
  //   //     // reformatedData2.push(vegaStylizedWeightsAndDates[item])
  //   //   })
  //   // }
  //   // console.log('vegaStylizedWeightsAndDates', vegaStylizedWeightsAndDates)
  //   fetchVega(vegaStylizedWeightsAndDates, appTheme)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [weightsAndDates])

  // Hmm twice? can we move appTheme up to [tickerSymbol,appTheme] ?
  // useEffect(
  //   () => {
  //     fetchVega(weightsAndDates, appTheme)
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [fetchedUwpData, appTheme]
  // )

  return (
    <Flex gap={10} col={isMobile}>
      <Flex id="token-weights-1" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
