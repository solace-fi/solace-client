import React, { useEffect, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { hydrateLibrary, metalog, simulateSIP, listSIPs, p, q } from '@solace-fi/hydrate'
import { Flex } from '../../components/atoms/Layout'
import { InputSection } from '../../components/molecules/InputSection'
import { Button } from '../../components/atoms/Button'
import volatility from '../../constants/volatility.json'
import { useGeneral } from '../../context/GeneralManager'

export const TokenPriceVolatilityHistogram = () => {
  const { appTheme } = useGeneral()
  const [tickerSymbol, setTickerSymbol] = useState('')
  const [displayVega, setDisplayVega] = useState(false)
  const [hydratedData, setHydratedData] = useState<any>(undefined)

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
        values: dataIn.aave.map((item: number) => {
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
              // title: 'Relative Frequency',
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

  const handleSubmit = async () => {
    try {
      const res: any = volatility
      const hydration: any = hydrateLibrary(res.data, 1000)
      fetchVega(hydration, appTheme)
      setHydratedData(hydration)
      setDisplayVega(true)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (hydratedData && displayVega) {
      fetchVega(hydratedData, appTheme)
    }
  }, [appTheme])

  return (
    <Flex col>
      <Flex gap={10} id="vis">
        <InputSection value={tickerSymbol} onChange={(e) => setTickerSymbol(e.target.value)} />
        <Button onClick={handleSubmit}>Get Quote</Button>
      </Flex>
    </Flex>
  )
}
