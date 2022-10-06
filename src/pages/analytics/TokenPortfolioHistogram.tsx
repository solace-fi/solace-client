import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { useAnalyticsContext } from './AnalyticsContext'
import vegaEmbed from 'vega-embed'
import { useGeneral } from '../../context/GeneralManager'
import { Text } from '../../components/atoms/Typography'
import { StyledSlider } from '../../components/atoms/Input'
import { Loader } from '../../components/atoms/Loader'
import { filterAmount, formatAmount } from '../../utils/formatting'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { PortfolioGaugeWeight } from './components/PortfolioGaugeWeightDisplay'
import { SmallerInputSection } from '../../components/molecules/InputSection'
import { Button } from '../../components/atoms/Button'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { StyledDownload } from '../../components/atoms/Icon'
import sipMath3 from '../../resources/svg/sipmath3.svg'

export const TokenPortfolioHistogram = ({
  chosenWidth,
  chosenHeight,
}: {
  chosenWidth: number
  chosenHeight: number
}): JSX.Element => {
  const { width } = useWindowDimensions()
  const { appTheme } = useGeneral()
  const { intrface, data } = useAnalyticsContext()
  const { canSeePortfolioVolatility } = intrface
  const { getPortfolioVolatility, allDataPortfolio, portfolioVolatilityData, fetchedSipMathLib } = data

  const [rangeValue, setRangeValue] = useState(1000)
  // const [varBar, setVarBar] = useState<number>(0)
  const var4Bar = useMemo(() => [1 - (10000 - rangeValue) / 10000], [rangeValue])
  const valueOfRiskPercentage = useMemo(() => ((var4Bar[0] - 1) * -100).toFixed(2), [var4Bar])

  const [simPortfolioVolatilityData, setSimPortfolioVolatilityData] = useState<number[]>(portfolioVolatilityData)
  const [simWeights, setSimWeights] = useState<{ name: string; weight: number; sim: any[] }[]>([])
  const [editingItem, setEditingItem] = useState<string | undefined>(undefined)
  const [commonPercentage, setCommonPercentage] = useState<string>('')

  const simWeightTotal = useMemo(() => parseFloat(simWeights.reduce((acc, cur) => acc + cur.weight, 0).toFixed(2)), [
    simWeights,
  ])

  const varBar = useMemo(() => {
    if (simPortfolioVolatilityData.length == 0) return 0
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
    return quantile(simPortfolioVolatilityData.sort(), var4Bar[0])
  }, [simPortfolioVolatilityData, var4Bar])

  const lossPercentage = useMemo(() => ((varBar - 1) * 100).toFixed(2), [varBar])

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
      height: chosenHeight - (chosenWidth > 4 ? 80 : chosenHeight * 0.7),
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

  const getItemStyle = useCallback(
    (isDragging: any, draggableStyle: any) => ({
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      padding: '2px',
      margin: `0 0 ${2}px 0`,

      // change background colour if dragging
      background: isDragging ? 'lightgreen' : 'transparent',
      borderRadius: '10px',

      // styles we need to apply on draggables
      ...draggableStyle,
    }),
    []
  )

  const getListStyle = useCallback(
    (isDraggingOver: boolean) => ({
      background: isDraggingOver ? 'grey' : 'transparent',
      padding: 2,
    }),
    []
  )

  const reorderWeights = useCallback(
    (startIndex: number, endIndex: number) => {
      const result = Array.from(simWeights)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)

      return result
    },
    [simWeights]
  )

  const onDragStart = useCallback((initial: any) => {
    if (!initial.source) return
  }, [])

  const onDragEnd = useCallback(
    (result: any) => {
      // dropped outside the list
      if (!result.destination) return

      const items = reorderWeights(result.source.index, result.destination.index)
      setSimWeights(items)
    },
    [reorderWeights]
  )

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

  const handleCommonPercentage = useCallback(() => {
    setSimWeights((prev) => {
      return prev.map((item) => {
        return { ...item, weight: parseFloat(formatAmount(commonPercentage)) / 100 }
      })
    })
  }, [commonPercentage, simWeights, saveEditedItem])

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
    if (simPortfolioVolatilityData.length == 0 || !canSeePortfolioVolatility || simWeightTotal != 1) return

    fetchVega(simPortfolioVolatilityData, appTheme, varBar)
  }, [
    simPortfolioVolatilityData,
    appTheme,
    canSeePortfolioVolatility,
    varBar,
    simWeightTotal,
    chosenWidth,
    chosenHeight,
    width,
  ])

  return (
    <Flex gap={10} col={4 >= chosenWidth}>
      {canSeePortfolioVolatility ? (
        <>
          <Flex col gap={12}>
            <Flex col gap={5}>
              <Text t5s>Set all percentages</Text>
              <Flex gap={5}>
                <SmallerInputSection
                  placeholder={'%'}
                  value={commonPercentage}
                  onChange={(e) => setCommonPercentage(filterAmount(e.target.value, commonPercentage))}
                  style={{
                    border: 'none',
                  }}
                />
                <Button onClick={handleCommonPercentage}>Set</Button>
              </Flex>
            </Flex>
            <Flex
              col
              thinScrollbar
              gap={12}
              px={14}
              style={{
                overflowY: 'auto',
                height: chosenHeight - (chosenWidth > 4 ? 120 : chosenHeight * 0.7),
              }}
            >
              <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      {simWeights.map((item, i) => {
                        return (
                          <Draggable key={item.name} draggableId={item.name} index={i}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                              >
                                <PortfolioGaugeWeight
                                  key={i}
                                  gaugeName={item.name}
                                  weight={item.weight}
                                  editingItem={editingItem}
                                  handleEditingItem={handleEditingItem}
                                  saveEditedItem={saveEditedItem}
                                />
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Flex>
            <Flex around gap={5} mt={10}>
              <img width={40} src={sipMath3} style={{ filter: appTheme == 'dark' ? 'brightness(200%)' : undefined }} />
              <Button disabled={!fetchedSipMathLib || !fetchedSipMathLib.sips} onClick={downloadLibrary}>
                <Text autoAlignVertical>Download Library</Text>
                <StyledDownload width={20} />
              </Button>
            </Flex>
          </Flex>
          <Flex col widthP={100}>
            {simWeightTotal == 1 ? (
              <>
                <Flex id="vis2" />
                <Flex col gap={10}>
                  <Text textAlignCenter t2={chosenWidth > 6}>
                    Today there is a {(100 - Number(valueOfRiskPercentage)).toFixed(2)}% chance of the value going down
                    by {Math.abs(Number(lossPercentage))}% or more.
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
              </>
            ) : (
              <Text textAlignCenter t2>
                Please make sure your weights add up to 100% ({simWeightTotal > 1 ? 'Remove' : 'Add'}{' '}
                {(Math.abs(simWeightTotal - 1) * 100).toFixed(2)}%)
              </Text>
            )}
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
