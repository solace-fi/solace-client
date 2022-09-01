import React, { useCallback, useEffect, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { hydrateLibrary, metalog, simulateSIP, listSIPs, p, q } from '@solace-fi/hydrate'
import { Flex } from '../../components/atoms/Layout'
import { InputSection } from '../../components/molecules/InputSection'
import { Button } from '../../components/atoms/Button'
import { useGeneral } from '../../context/GeneralManager'
import axios from 'axios'

export const TokenPriceVolatilityHistogram = () => {
  const { appTheme } = useGeneral()
  const [tickerSymbol, setTickerSymbol] = useState('')
  const [displayVega, setDisplayVega] = useState(false)
  const [hydratedData, setHydratedData] = useState<any>(undefined)
  const [acceptedTickers, setAcceptedTickers] = useState<string[]>([])

  function fetchVega(dataIn: any, theme: string) {
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
            var: 0.99,
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
            color: { value: 'yellow' },
            size: { value: 3 },
          },
        },
      ],
    })
  }

  const handleSubmit = useCallback(async () => {
    try {
      fetchVega(hydratedData[tickerSymbol], appTheme)
      setDisplayVega(true)
    } catch (e) {
      console.log(e)
    }
  }, [appTheme, hydratedData, tickerSymbol])

  useEffect(() => {
    const mountAndHydrate = async () => {
      const res: any = await axios.get(`https://stats-cache.solace.fi/volatility.json`)
      const hydration: any = hydrateLibrary(res.data.data, 1000)
      Object.keys(hydration).map((key) => {
        setAcceptedTickers((acceptedTickers) => [...acceptedTickers, key])
      })
      setHydratedData(hydration)
    }
    mountAndHydrate()
  }, [])

  useEffect(() => {
    if (hydratedData && displayVega) fetchVega(hydratedData[tickerSymbol], appTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appTheme])

  return (
    <Flex col>
      <Flex gap={10} id="vis">
        <InputSection
          value={tickerSymbol}
          onChange={(e) => setTickerSymbol(e.target.value)}
          placeholder={'Token Symbol'}
        />
        <Button onClick={handleSubmit} disabled={!acceptedTickers.includes(tickerSymbol.toLowerCase())}>
          Get Quote
        </Button>
      </Flex>
    </Flex>
  )
}
