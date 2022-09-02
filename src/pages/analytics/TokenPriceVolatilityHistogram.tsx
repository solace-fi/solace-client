import React, { useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { useGeneral } from '../../context/GeneralManager'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { DropdownOptionsUnique } from '../../components/organisms/Dropdown'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useAnalyticsContext } from './AnalyticsContext'
import { q } from '@solace-fi/hydrate'

export const TokenPriceVolatilityHistogram = () => {
  const { appTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const { volatilityData, hydratedVolatilityData, acceptedTickers } = useAnalyticsContext()
  const [tickerSymbol, setTickerSymbol] = useState('')
  const [displayVega, setDisplayVega] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const activeList = useMemo(
    () =>
      (searchTerm
        ? acceptedTickers.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
        : acceptedTickers
      ).map((ticker) => {
        return {
          label: ticker.toLowerCase(),
          value: ticker.toLowerCase(),
          icon: <img src={`https://assets.solace.fi/${ticker.toLowerCase()}`} height={24} />,
        }
      }),
    [searchTerm, acceptedTickers]
  )

  const getVarBar = () => {
    const p = [0.05]
    const sips = volatilityData.data.data.sips
    const tokenSip = sips.find((sip: any) => sip.name === tickerSymbol)
    if (!tokenSip) return 0.99
    const aCoefficients = tokenSip.arguments.aCoefficients
    const varBar = q(p, aCoefficients, undefined, undefined)
    return varBar[0]
  }

  const fetchVega = (dataIn: any, theme: 'light' | 'dark', varBar = 0.99) => {
    vegaEmbed('#vis', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Simulated Daily Price Changes', color: theme == 'light' ? 'black' : 'white' },
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
            x: item,
            var: varBar,
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
          },
        },
        {
          mark: 'rule',
          encoding: {
            x: { aggregate: 'mean', field: 'var' },
            color: { value: 'lightgreen' },
            size: { value: 3 },
          },
        },
      ],
    })
  }

  useEffect(() => {
    if (!tickerSymbol && !volatilityData?.data?.data?.sips) return
    const varBar = getVarBar()
    fetchVega(hydratedVolatilityData[tickerSymbol], appTheme, varBar)
    setDisplayVega(true)
  }, [tickerSymbol])

  useEffect(
    () => {
      if (!hydratedVolatilityData || !displayVega || !volatilityData?.data?.data?.sips) return
      const varBar = getVarBar()
      fetchVega(hydratedVolatilityData[tickerSymbol], appTheme, varBar)
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <DropdownOptionsUnique
          isOpen={true}
          searchedList={activeList}
          comparingList={[tickerSymbol.toLowerCase()]}
          onClick={(value: string) => setTickerSymbol(value)}
          processName={false}
        />
      </Flex>
      <Flex id="vis" widthP={100} justifyCenter>
        <Text autoAlign>Please select a token to view its volatility</Text>
      </Flex>
    </Flex>
  )
}
