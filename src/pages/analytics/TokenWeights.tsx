import React, { useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { getWeightsFromBalances, useAnalyticsContext } from './AnalyticsContext'
// import { calculateMonthlyTicks, xtickLabelFormatter } from '../../utils/chart'
import { useGeneral } from '../../context/GeneralManager'
import { useNetwork } from '../../context/NetworkManager'
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

export const TokenWeights = ({
  chosenWidth,
  chosenHeight,
}: {
  chosenWidth: number
  chosenHeight: number
}): JSX.Element => {
  const { appTheme } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { isMobile } = useWindowDimensions()
  const { data } = useAnalyticsContext()
  const { fetchedUwpData } = data
  const [weightsAndDates, setWeightsAndDates] = useState<WeightsAndDates>([])
  const _weightsAndDates = fetchedUwpData?.[`${activeNetwork.chainId}`]?.map((uwp) => {
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

  const vegaStylizedWeightsAndDates = useMemo(
    () =>
      weightsAndDates
        .map((wad) => {
          const { timestamp, weights } = wad
          const vegaStylizedWeights = weights.map((w) => {
            const ticker = Object.keys(w)[0]
            const weight = w[ticker]
            return { ticker, y: weight, timestamp: timestamp * 1000 }
          })
          return vegaStylizedWeights
        })
        .flat(),
    [weightsAndDates]
  )

  useEffect(() => {
    _weightsAndDates && setWeightsAndDates(_weightsAndDates)
  }, [fetchedUwpData])

  const fetchVega = (
    dataIn: {
      ticker: string
      y: number
      timestamp: number
    }[],
    theme: 'light' | 'dark'
  ) => {
    vegaEmbed('#token-weights', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Token Weights, Last 30 Days', color: theme == 'light' ? 'black' : 'white' },
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
          timeUnit: 'yearmonthdate',
          field: 'timestamp',
          title: 'Date',
          axis: { title: '', grid: false },
        },
        y: {
          aggregate: 'sum',
          field: 'y',
          // axis: null,
          stack: 'normalize',
          title: '% Weight',
          axis: { format: '.0%', title: '% Weight', titleColor: theme == 'light' ? 'black' : 'white', grid: false },
        },
        color: {
          field: 'ticker',
          scale: { scheme: 'category20b' },
          legend: {
            titleColor: theme == 'light' ? 'black' : 'white',
            labelColor: theme == 'light' ? 'black' : 'white',
            title: 'Tokens',
            orient: chosenWidth < 3 ? 'bottom' : 'right',
            direction: 'vertical',
          },
        },
      },
    })
  }
  useEffect(() => {
    fetchVega(vegaStylizedWeightsAndDates, appTheme)
  }, [appTheme, vegaStylizedWeightsAndDates, chosenWidth, chosenHeight])

  return (
    <Flex gap={10} col={isMobile}>
      <Flex id="token-weights" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
