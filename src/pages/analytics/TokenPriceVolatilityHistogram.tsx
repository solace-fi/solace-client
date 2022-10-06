import React, { useCallback, useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../components/atoms/Layout'
import { useGeneral } from '../../context/GeneralManager'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { DropdownOptions } from '../../components/organisms/Dropdown'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useAnalyticsContext } from './AnalyticsContext'
import { q } from '@solace-fi/hydrate'
import { StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { Button } from '../../components/atoms/Button'
import { StyledDownload } from '../../components/atoms/Icon'
import sipMath3 from '../../resources/svg/sipmath3.svg'

export const TokenPriceVolatilityHistogram = ({
  chosenWidth,
  chosenHeight,
}: {
  chosenWidth: number
  chosenHeight: number
}): JSX.Element => {
  const { width } = useWindowDimensions()
  const { appTheme } = useGeneral()
  const { intrface, data } = useAnalyticsContext()
  const { canSeeTokenVolatilities } = intrface
  const { tokenHistogramTickers, fetchedSipMathLib, allDataPortfolio } = data
  const [tickerSymbol, setTickerSymbol] = useState('')
  const [displayVega, setDisplayVega] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [rangeValue, setRangeValue] = useState(1000)
  const [varBar, setVarBar] = useState<number>(0)
  const var4Bar = useMemo(() => [1 - (10000 - rangeValue) / 10000], [rangeValue]) // rangeValue can only be 1 - 9990
  const valueOfRiskPercentage = useMemo(() => ((var4Bar[0] - 1) * -100).toFixed(2), [var4Bar])
  const lossPercentage = useMemo(() => ((varBar - 1) * 100).toFixed(2), [varBar])

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

  const getVarBar = (p: any, tickerSymbolIn: string | undefined) => {
    //const p = [0.05] // TODO: make this dynamic value based on user input with a slider
    const sips = fetchedSipMathLib?.sips
    // console.log('sips', sips, tickerSymbolIn)
    const tokenSip = sips?.find((sip: any) => sip.name === tickerSymbolIn)
    // console.log('tokenSip', tokenSip)
    if (!tokenSip) return 0.99
    const aCoefficients = tokenSip.arguments.aCoefficients
    // console.log('aCoefficients', aCoefficients)
    const quantile = q(p, aCoefficients, undefined, undefined)
    // console.log('quantile', quantile[0])
    // at this VaR, you can lose up to (1 - quantile[0]) * 100 % of your portfolio
    return quantile[0]
  }

  const fetchVega = (dataIn: any, theme: 'light' | 'dark', varBar: number) => {
    vegaEmbed('#vis', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: {
        text: `${dataIn.symbol.toUpperCase()}` + ' Daily % Price Change',
        color: theme == 'light' ? 'black' : 'white',
      },
      config: {
        style: { cell: { stroke: 'transparent' } },
        axis: { labelColor: theme == 'light' ? 'black' : 'white' },
      },
      background: 'transparent',
      width: 'container',
      height: chosenHeight - (chosenWidth > 4 ? 80 : chosenHeight * 0.7),
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
        // {
        //   mark: {
        //     type: 'text',
        //     align: 'left',
        //     text: [`VaR at ${valueOfRiskPercentage}%`, `${((varBar - 1) * 100).toFixed(2)}% loss or more`],
        //     dx: 50,
        //     fontSize: 22,
        //     color: theme == 'light' ? 'black' : 'white',
        //   },
        // },
      ],
    })
  }

  const downloadFile = ({ data, fileName, fileType }: { data: string; fileName: string; fileType: string }) => {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: fileType })
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement('a')
    a.download = fileName
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()
  }

  const downloadLibrary = useCallback(
    (e) => {
      if (!fetchedSipMathLib || !fetchedSipMathLib.sips) return
      e.preventDefault()
      downloadFile({
        data: JSON.stringify(fetchedSipMathLib),
        fileName: 'volatility.json',
        fileType: 'text/json',
      })
    },
    [fetchedSipMathLib]
  )

  useEffect(() => {
    if (!tickerSymbol) {
      // we must set tickerSymbol to the symbol with the highest weight in the portfolio
      const highestWeightTicker = allDataPortfolio.length
        ? allDataPortfolio.reduce((prev, current) => (prev.weight > current.weight ? prev : current))
        : undefined
      if (highestWeightTicker) setTickerSymbol(highestWeightTicker.symbol)
    }
    if (tickerSymbol.length === 0 || !canSeeTokenVolatilities) return
    const chartDataIndex = allDataPortfolio.findIndex((x) => x.symbol === tickerSymbol)
    const varBar = getVarBar(var4Bar, tickerSymbol)
    setVarBar(varBar)
    fetchVega(allDataPortfolio[chartDataIndex], appTheme, varBar)
    if (!displayVega) setDisplayVega(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerSymbol, var4Bar, appTheme, allDataPortfolio, canSeeTokenVolatilities, chosenWidth, chosenHeight, width])

  return (
    <Flex gap={10} col={4 >= chosenWidth || !canSeeTokenVolatilities}>
      {canSeeTokenVolatilities ? (
        <>
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
              searchedList={activeList.sort((a, b) => a.label.localeCompare(b.label))}
              comparingList={[tickerSymbol]}
              onClick={(value: string) => setTickerSymbol(value)}
              processName={true}
              customProcessFunction={(value: string) => value.toUpperCase()}
              customHeight={chosenHeight - (chosenWidth > 4 ? 80 : chosenHeight * 0.6)}
            />
            <Flex around gap={5} mt={10}>
              <img width={40} src={sipMath3} style={{ filter: appTheme == 'dark' ? 'brightness(200%)' : undefined }} />
              <Button disabled={!fetchedSipMathLib || !fetchedSipMathLib.sips} onClick={downloadLibrary}>
                <Text autoAlignVertical>Download Library</Text>
                <StyledDownload width={20} />
              </Button>
            </Flex>
          </Flex>
          <Flex col widthP={100}>
            <Flex id="vis" widthP={100} justifyCenter>
              <Text autoAlign>Please select a token to view its volatility</Text>
            </Flex>
            {displayVega && (
              <Flex col gap={10} mt={8}>
                <Text textAlignCenter t2={chosenWidth > 6}>
                  Today there is a {(100 - Number(valueOfRiskPercentage)).toFixed(2)}% chance of{' '}
                  <Text inline semibold info>
                    {tickerSymbol.toUpperCase()}
                  </Text>{' '}
                  going down by {Math.abs(Number(lossPercentage))}% or more.
                </Text>
                <Flex col>
                  <Text textAlignCenter>Use the slider below to adjust the value of risk</Text>
                  <StyledSlider
                    value={rangeValue}
                    onChange={(e) => {
                      setRangeValue(parseInt(e.target.value))
                    }}
                    min={1}
                    max={1000} // 10% of 10000 is 1000, so that we limit the slider for the user
                  />
                </Flex>
              </Flex>
            )}
          </Flex>
        </>
      ) : canSeeTokenVolatilities == false ? (
        <Text textAlignCenter t2>
          This chart cannot be viewed at this time
        </Text>
      ) : (
        <Loader />
      )}
    </Flex>
  )
}
