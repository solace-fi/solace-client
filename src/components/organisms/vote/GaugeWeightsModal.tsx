import React, { useCallback, useEffect, useMemo, useState } from 'react'
import vegaEmbed from 'vega-embed'
import { Flex } from '../../atoms/Layout'
import { Text } from '../../atoms/Typography'
import { useGeneral } from '../../../context/GeneralManager'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { Modal } from '../../molecules/Modal'
import { Accordion } from '../../atoms/Accordion'
import { SmallerInputSection } from '../../molecules/InputSection'
import { truncateValue } from '../../../utils/formatting'

export const GaugeWeightsModal = ({
  isOpen,
  handleClose,
  handleViewCurrentData,
  currentWeightsData,
  nextWeightsData,
  chartTopColors,
  textTopColors,
  chartSubColors,
  textSubColors,
  topColorTypes,
  subColorTypes,
  viewCurrentData,
}: {
  isOpen: boolean
  handleClose: () => void
  handleViewCurrentData: (toggle: boolean) => void
  currentWeightsData: { name: string; value: number; usdValue: number }[]
  nextWeightsData: { name: string; value: number; usdValue: number }[]
  chartTopColors: string[]
  textTopColors: string[]
  chartSubColors: string[]
  textSubColors: string[]
  topColorTypes: string[]
  subColorTypes: string[]
  viewCurrentData: boolean
}): JSX.Element => {
  const { appTheme } = useGeneral()
  const { width, isMobile } = useWindowDimensions()
  const [searchTerm, setSearchTerm] = useState('')

  const searchedList = useMemo(() => {
    const dataToUse = viewCurrentData ? currentWeightsData : nextWeightsData
    return searchTerm ? dataToUse.filter((item) => item.name.includes(searchTerm.toLowerCase())) : dataToUse
  }, [searchTerm, currentWeightsData, nextWeightsData, viewCurrentData])

  function fetchVega(theme: 'light' | 'dark') {
    const dataToUse = viewCurrentData ? currentWeightsData : nextWeightsData
    vegaEmbed('#gauge-weights-pie-full', {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      config: {
        style: { cell: { stroke: 'transparent' } },
        axis: { labelColor: theme == 'light' ? 'black' : 'white' },
        font: 'Montserrat',
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
        values: dataToUse.map((item: any, i) => {
          return {
            name: item.name,
            value: item.value / 100,
            usdValue: item.usdValue,
            colorType: i < topColorTypes.length ? topColorTypes[i] : subColorTypes[i % subColorTypes.length],
            index: i,
          }
        }),
      },
      layer: [
        {
          mark: {
            type: 'arc',
            stroke: '#fff',
          },
        },
      ],
      encoding: {
        tooltip: [
          { field: 'name', type: 'nominal' },
          { field: 'value', type: 'quantitative', format: '.0%' },
        ],
        theta: { field: 'value', type: 'quantitative', stack: 'normalize' },
        color: {
          field: 'colorType',
          type: 'nominal',
          legend: null,
          scale: {
            domain: [...topColorTypes, ...subColorTypes],
            range: [...chartTopColors, ...chartSubColors],
          },
        },
        order: { field: 'index', type: 'quantitative', sort: 'ascending' },
      },
    })
  }

  useEffect(() => {
    fetchVega(appTheme)
  }, [isOpen, width, appTheme, currentWeightsData, nextWeightsData, viewCurrentData])

  return (
    <Modal modalTitle="Gauge Weights" isOpen={isOpen} handleClose={handleClose}>
      <Flex
        stretch
        bgTertiary
        pt={1}
        style={{
          // rounded at the top only with 12px
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      >
        <Flex
          justifyCenter
          py={8}
          bgSecondary={viewCurrentData}
          flex1
          onClick={() => handleViewCurrentData(true)}
          style={{
            userSelect: 'none',
            cursor: 'pointer',
            borderTopLeftRadius: viewCurrentData ? 12 : 0,
            borderTopRightRadius: viewCurrentData ? 12 : 0,
          }}
        >
          <Text semibold opposite={!viewCurrentData}>
            Current
          </Text>
        </Flex>
        <Flex
          justifyCenter
          py={8}
          flex1
          bgSecondary={!viewCurrentData}
          onClick={() => handleViewCurrentData(false)}
          style={{
            userSelect: 'none',
            cursor: 'pointer',
            // rounded only top right corner
            borderTopRightRadius: !viewCurrentData ? 12 : 0,
            borderTopLeftRadius: !viewCurrentData ? 12 : 0,
          }}
        >
          <Text semibold opposite={viewCurrentData}>
            Projected
          </Text>
        </Flex>
      </Flex>
      <Flex col={isMobile} row={!isMobile} gap={10} bgSecondary rounded p={12}>
        <Flex id="gauge-weights-pie-full" width={400} widthP={isMobile ? 100 : undefined} justifyCenter>
          <Text autoAlign>data not available</Text>
        </Flex>
        <Flex col gap={10}>
          <SmallerInputSection
            placeholder={'Search'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
            }}
          />
          <Accordion isOpen thinScrollbar customHeight={'200px'} noBackgroundColor>
            <Flex col py={4} bgRaised>
              {searchedList.map((entry, index) => (
                <Flex key={`${entry.name}-${index}`} between px={10} py={4} gap={10}>
                  <Flex gap={10}>
                    {entry.name !== 'Other Protocols' && (
                      <img src={`https://assets.solace.fi/zapperLogos/${entry.name}`} height={24} />
                    )}
                    <Text
                      bold
                      textAlignLeft
                      style={{
                        color:
                          index < textTopColors.length
                            ? textTopColors[index]
                            : textSubColors[index % textSubColors.length],
                      }}
                    >{`${entry.name}`}</Text>
                  </Flex>
                  <Text
                    bold
                    textAlignRight
                    style={{
                      color:
                        index < textTopColors.length
                          ? textTopColors[index]
                          : textSubColors[index % textSubColors.length],
                    }}
                  >{`$${truncateValue(entry.usdValue, 2)}`}</Text>
                </Flex>
              ))}
              {searchedList.length === 0 && (
                <Text t3 textAlignCenter bold>
                  No results found
                </Text>
              )}
            </Flex>
          </Accordion>
        </Flex>
      </Flex>
    </Modal>
  )
}
