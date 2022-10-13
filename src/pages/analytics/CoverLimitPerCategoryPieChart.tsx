import React, { useEffect } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useAnalyticsContext } from './AnalyticsContext'
import vegaEmbed from 'vega-embed'
import { useGeneral } from '../../context/GeneralManager'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { ProtocolExposureType } from './constants'

export const CoverLimitCategoryPieChart = ({
  chosenWidth,
  chosenHeight,
}: {
  chosenWidth: number
  chosenHeight: number
}): JSX.Element => {
  const { appTheme } = useGeneral()
  const { width } = useWindowDimensions()
  const { data } = useAnalyticsContext()
  const { protocolExposureData: protocols } = data

  function fetchVega(dataIn: any, theme: 'light' | 'dark') {
    const totalCoverageLimit = dataIn.reduce((acc: number, item: any) => {
      return acc + item.coverLimit
    }, 0)
    vegaEmbed('#balance-per-category-chart', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
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
            category: item.category,
            coverLimit: item.coverLimit,
            percentage: item.coverLimit / totalCoverageLimit,
          }
        }),
      },
      layer: [
        {
          mark: { type: 'arc', innerRadius: 20, stroke: '#fff', tooltip: true },
        },
      ],
      encoding: {
        tooltip: [
          { field: 'category', type: 'nominal' },
          { field: 'coverLimit', type: 'quantitative' },
          { field: 'percentage', type: 'quantitative', format: '.2%' },
        ],
        theta: { field: 'coverLimit', type: 'quantitative', stack: 'normalize' },
        radius: { field: 'coverLimit', scale: { type: 'sqrt', zero: true, rangeMin: 20 } },
        color: {
          field: 'category',
          type: 'nominal',
          legend: {
            titleColor: theme == 'light' ? 'black' : 'white',
            labelColor: theme == 'light' ? 'black' : 'white',
            title: 'Categories',
            direction: 'vertical',
          },
          sort: { field: 'coverLimit', order: 'descending' },
        },
        order: { field: 'coverLimit', type: 'quantitative', sort: 'ascending' },
      },
    })
  }

  useEffect(() => {
    const getData = async () => {
      const categoryToCoverLimitMapping: { [key: string]: number } = {}
      protocols.forEach((protocol: ProtocolExposureType) => {
        if (categoryToCoverLimitMapping[protocol.category]) {
          categoryToCoverLimitMapping[protocol.category] += protocol.coverLimit
        } else {
          categoryToCoverLimitMapping[protocol.category] = protocol.coverLimit
        }
      })
      const categoryAndCoverLimitArray = Object.keys(categoryToCoverLimitMapping).map((category) => {
        return {
          category,
          coverLimit: categoryToCoverLimitMapping[category],
        }
      })
      fetchVega(categoryAndCoverLimitArray, appTheme)
    }
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocols, chosenHeight, chosenWidth, appTheme, width])

  return (
    <Flex gap={10}>
      <Flex id="balance-per-category-chart" widthP={100} justifyCenter>
        <Text autoAlign>data not available</Text>
      </Flex>
    </Flex>
  )
}
