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
import { StyledSlider } from '../../components/atoms/Input'

export const TokenPriceVolatilityHistogram = () => {
  const { appTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const { acceptedTickers, sipMathLib, allDataPortfolio } = useAnalyticsContext()
  const [tickerSymbol, setTickerSymbol] = useState('')
  const [displayVega, setDisplayVega] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [var4Bar, setVar4Bar] = useState([0.01])
  const disabled = false
  const activeList = useMemo(
    // TODO: ticker symbols or project names? /vote is using names
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

  const getVarBar = (p: any, tickerSymbolIn: string | undefined) => {
    //const p = [0.05] // TODO: make this dynamic value based on user input with a slider
    const sips = sipMathLib.data.sips
    console.log('sips', sips, tickerSymbolIn)
    const tokenSip = sips.find((sip: any) => sip.name === tickerSymbolIn)
    console.log('tokenSip', tokenSip)
    if (!tokenSip) return 0.99
    const aCoefficients = tokenSip.arguments.aCoefficients
    console.log('aCoefficients', aCoefficients)
    const quantile = q(p, aCoefficients, undefined, undefined)
    console.log('quantile', quantile[0])
    return quantile[0]
  }

  const fetchVega = (dataIn: any, theme: 'light' | 'dark', varBar: number, weight: any, symbol: string) => {
    vegaEmbed('#vis', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: `${symbol.toUpperCase()}` + ' Daily % Price Change', color: theme == 'light' ? 'black' : 'white' },
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
      // signals: [{ name: 'varBar', value: 0, bind: { input: 'range', min: -0.1, max: 0.1 } }],
      data: {
        name: 'table',
        values: dataIn.simulation.map((item: number) => {
          return {
            x: (item - 1) * 100,
            var: (varBar - 1) * 100,
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
          mark: { type: 'bar', tooltip: false },
          encoding: {
            x: {
              field: 'bin_Range',
              bin: { binned: true, maxbins: 20, anchor: 1 },
              // scale: { domain: [-50, 50] },
              title: '',
            },
            x2: { field: 'bin_Range_end' },
            y: {
              axis: {
                title: 'Frequency',
                titleColor: theme == 'light' ? 'black' : 'white',
                format: '.1~%',
              },
              field: 'PercentOfTotal',
              type: 'quantitative',
            },
            color: { value: '#D478D8' },
          },
        },
        {
          mark: 'rule',
          encoding: {
            x: { aggregate: 'mean', field: 'var' },
            color: { value: '#F04D42' },
            size: { value: 3 },
          },
        },
        {
          mark: {
            type: 'text',
            align: 'left',
            text: [`VaR at ${(var4Bar[0] * 100).toFixed(2)}%`, `${weight.toFixed(2)}% of the pool`],
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
    console.log('chartDataIndex', allDataPortfolio[chartDataIndex])
    // const varProbability: any = [0.01] // VaR should become dynamic with a slider
    const varBar = getVarBar([var4Bar], allDataPortfolio[chartDataIndex].symbol)

    fetchVega(
      allDataPortfolio[chartDataIndex],
      appTheme,
      varBar,
      allDataPortfolio[chartDataIndex].weight,
      allDataPortfolio[chartDataIndex].symbol
    )
    setDisplayVega(true)
  }, [tickerSymbol, var4Bar])

  // Hmm twice? can we move appTheme up to [tickerSymbol,appTheme] ?
  useEffect(
    () => {
      if (!displayVega || !sipMathLib) return
      const varProbability: any = [0.01] // VaR should become dynamic with a slider
      const varBar = getVarBar(varProbability, tickerSymbol)
      const chartDataIndex = allDataPortfolio.findIndex((x) => x.symbol === tickerSymbol)
      fetchVega(
        allDataPortfolio[chartDataIndex],
        appTheme,
        varBar,
        allDataPortfolio[chartDataIndex].weight,
        allDataPortfolio[chartDataIndex].symbol
      )
    },
    [appTheme] // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <StyledSlider
        value={50}
        onChange={(e) => {
          setVar4Bar([e.target.valueAsNumber / 1000]) // CAUTION can only slide to 0.1
          console.log('get quantile for this probability ', e.target.valueAsNumber / 1000)
        }}
        min={1}
        max={100}
        disabled={disabled}
      />
    </Flex>
  )
}
