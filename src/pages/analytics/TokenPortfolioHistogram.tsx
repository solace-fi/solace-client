import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useAnalyticsContext } from './AnalyticsContext'
import vegaEmbed from 'vega-embed'
import { useGeneral } from '../../context/GeneralManager'
import { Text } from '../../components/atoms/Typography'
import { StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { formatAmount } from '../../utils/formatting'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { PortfolioGaugeWeight } from './components/PortfolioGaugeWeightDisplay'

export const TokenPortfolioHistogram = () => {
  const { appTheme } = useGeneral()
  const { isMobile } = useWindowDimensions()
  const { intrface, data } = useAnalyticsContext()
  const { canSeePortfolioVolatility } = intrface
  const { getPortfolioVolatility, allDataPortfolio, portfolioVolatilityData } = data

  const [rangeValue, setRangeValue] = useState(995)
  const [varBar, setVarBar] = useState<number>(0)
  const var4Bar = useMemo(() => [1 - (10000 - rangeValue) / 10000], [rangeValue])
  const valueOfRiskPercentage = useMemo(() => ((var4Bar[0] - 1) * -100).toFixed(2), [var4Bar])
  const lossPercentage = useMemo(() => ((varBar - 1) * 100).toFixed(2), [varBar])

  const [simPortfolioVolatilityData, setSimPortfolioVolatilityData] = useState<number[]>(portfolioVolatilityData)
  const [simWeights, setSimWeights] = useState<{ name: string; weight: number; sim: any[] }[]>([])
  const [editingItem, setEditingItem] = useState<string | undefined>(undefined)

  function fetchVega(dataIn: any, theme: 'light' | 'dark', varBar: number) {
    vegaEmbed('#vis2', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: { text: 'Portfolio Daily % Price Change', color: theme == 'light' ? 'black' : 'white' },
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
            color: { value: '#5F5DF9' },
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
      ],
    })
  }

  const handleEditingItem = useCallback((name?: string) => {
    setEditingItem(name)
  }, [])

  const saveEditedItem = useCallback(
    (name: string, newWeight: string): boolean => {
      const targetGauge = simWeights.find((item) => item.name == name)
      if (!targetGauge) return false
      if (targetGauge.weight.toString() === newWeight) return false
      const numberifiedNewWeight = parseFloat(formatAmount(newWeight))
      setSimWeights((prev) => {
        return prev.map((item) => {
          if (item.name == name) {
            return { ...item, weight: numberifiedNewWeight }
          }
          return item
        })
      })
      return true
    },
    [simWeights]
  )

  useEffect(() => {
    setSimWeights(
      allDataPortfolio.map((item: any) => {
        return { name: item.symbol, weight: item.weight, sim: item.simulation }
      })
    )
  }, [allDataPortfolio])

  useEffect(() => {
    const _simPortfolioVolatilityData = getPortfolioVolatility(
      simWeights.map((item) => item.weight),
      simWeights.map((item) => item.sim)
    )
    setSimPortfolioVolatilityData(_simPortfolioVolatilityData)
  }, [simWeights, getPortfolioVolatility])

  useEffect(() => {
    if (simPortfolioVolatilityData.length == 0 || !canSeePortfolioVolatility) return
    const quantile = (arr: number[], q: number) => {
      // const sorted = asc(arr); // CAUTION assumed array is sorted
      const sorted = arr
      const pos = (sorted.length - 1) * q
      const base = Math.floor(pos)
      const rest = pos - base
      if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base])
      } else {
        return sorted[base]
      }
    }
    const varBar = quantile(simPortfolioVolatilityData.sort(), var4Bar[0])
    setVarBar(varBar)
    fetchVega(simPortfolioVolatilityData, appTheme, varBar)
  }, [simPortfolioVolatilityData, appTheme, canSeePortfolioVolatility, var4Bar])

  return (
    <Flex gap={10} col={isMobile}>
      {canSeePortfolioVolatility ? (
        <>
          <Flex
            width={200}
            col
            thinScrollbar
            gap={12}
            pt={20}
            px={14}
            pb={10}
            style={{
              overflowY: 'auto',
              height: '300px',
            }}
          >
            {simWeights.map((item, i) => {
              return (
                <PortfolioGaugeWeight
                  key={i}
                  gaugeName={item.name}
                  weight={item.weight}
                  editingItem={editingItem}
                  handleEditingItem={handleEditingItem}
                  saveEditedItem={saveEditedItem}
                  simWeights={simWeights}
                />
              )
            })}
          </Flex>
          <Flex col widthP={100}>
            <Flex id="vis2" />
            <Flex col gap={10}>
              <Text textAlignCenter t2>
                Today there is a {(100 - Number(valueOfRiskPercentage)).toFixed(2)}% chance of the value going down by{' '}
                {Math.abs(Number(lossPercentage))}% or more.
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
          </Flex>
        </>
      ) : canSeePortfolioVolatility == false ? (
        <Text textAlignCenter t2>
          This chart cannot be viewed at this time
        </Text>
      ) : (
        <Loader />
      )}
    </Flex>
  )
}
