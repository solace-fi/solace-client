import React, { useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { useGeneral } from '../../context/GeneralManager'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { DropdownOptions } from '../../components/organisms/Dropdown'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useAnalyticsContext } from './AnalyticsContext'
import { q } from '@solace-fi/hydrate'

export const TokenPriceVolatilityCumm = (): JSX.Element => {
  const { appTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const { data } = useAnalyticsContext()
  const { tokenHistogramTickers, fetchedSipMathLib, allDataPortfolio } = data
  const [tickerSymbol, setTickerSymbol] = useState('')
  const [displayVega, setDisplayVega] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const activeList = useMemo(
    // TODO: ticker symbols or project names? /vote is using names
    () =>
      (searchTerm
        ? tokenHistogramTickers.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
        : tokenHistogramTickers
      ).map((ticker) => {
        return {
          label: ticker.toLowerCase(),
          value: ticker.toLowerCase(),
          icon: <img src={`https://assets.solace.fi/${ticker.toLowerCase()}`} height={24} />,
        }
      }),
    [searchTerm, tokenHistogramTickers]
  )

  const fetchVega = (dataIn: any, density: any[], theme: 'light' | 'dark', weight: any, symbol: string) => {
    vegaEmbed('#vis3', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: `${symbol.toUpperCase()}` + ' Cummulative Density', color: theme == 'light' ? 'black' : 'white' },
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
        values: density.map((item: number) => {
          return {
            x: q([item], dataIn, undefined, undefined),
            y: item,
          }
        }),
      },
      layer: [
        {
          mark: { type: 'point', filled: true },
          encoding: {
            x: { field: 'x', type: 'quantitative', scale: { domain: [0.7, 1.1] } },
            y: { field: 'y', type: 'quantitative' },
            color: { value: '#D478D8' },
            size: { value: 100 },
          },
        },
        {
          mark: {
            type: 'text',
            align: 'left',
            // text: [`${weight.toFixed(2)}% of the pool`],
            dx: 50,
            fontSize: 22,
            color: theme == 'light' ? 'black' : 'white',
          },
        },
      ],
    })
  }

  useEffect(() => {
    if (!tickerSymbol) return
    const chartDataIndex = allDataPortfolio.findIndex((x) => x.symbol === tickerSymbol)
    const result = fetchedSipMathLib?.sips.filter((obj: { name: any }) => {
      return obj.name === allDataPortfolio[chartDataIndex].symbol
    })
    const sipsAcoeffs = result?.[0].arguments.aCoefficients
    const density = Array.from(Array(99).keys(), (n) => n / 100 + 0.01)
    console.log(density)

    fetchVega(
      sipsAcoeffs,
      density,
      appTheme,
      allDataPortfolio[chartDataIndex].weight,
      allDataPortfolio[chartDataIndex].symbol
    )
    setDisplayVega(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerSymbol])

  // Hmm twice? can we move appTheme up to [tickerSymbol,appTheme] ?
  useEffect(
    () => {
      if (!tickerSymbol) return
      const chartDataIndex = allDataPortfolio.findIndex((x) => x.symbol === tickerSymbol)
      // const result = fetchedSipMathLib?.sips.filter((obj: { name: any }) => {
      //   return obj.name === allDataPortfolio[chartDataIndex].symbol
      // })
      const density = Array.from(Array(99).keys(), (n) => n / 100 + 0.01)
      console.log(density)
      fetchVega(
        allDataPortfolio[chartDataIndex],
        density,
        appTheme,
        allDataPortfolio[chartDataIndex].weight,
        allDataPortfolio[chartDataIndex].symbol
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appTheme]
  )

  return (
    <Flex gap={10} col={isMobile}>
      <Flex col>
        <SmallerInputSection
          placeholder={'Search'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '250px',
            border: 'none',
          }}
        />
        <DropdownOptions
          isOpen={true}
          searchedList={activeList}
          comparingList={[tickerSymbol.toLowerCase()]}
          onClick={(value: string) => setTickerSymbol(value)}
          processName={false}
        />
      </Flex>
      <Flex id="vis3" widthP={100} justifyCenter>
        <Text autoAlign>Please select a token to view its volatility</Text>
      </Flex>
    </Flex>
  )
}
