import React, { useCallback, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, TooltipProps } from 'recharts'

import { Flex } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { Modal } from '../molecules/Modal'
import { Accordion } from '../atoms/Accordion'
import { SmallerInputSection } from '../molecules/InputSection'
import { truncateValue } from '../../utils/formatting'

export const CustomPieChartTooltip = ({ active, payload }: TooltipProps<number, string>): JSX.Element => {
  const { appTheme } = useGeneral()

  return (
    <>
      {active && (
        <div
          style={{
            backgroundColor: appTheme == 'light' ? '#ffff' : '#2a2f3b',
            padding: '5px',
            borderRadius: '10px',
          }}
        >
          <Text>{`${payload?.[0].name} : ${payload?.[0].value}%`}</Text>
        </div>
      )}
    </>
  )
}

export const GaugeWeightsModal = ({
  isOpen,
  handleClose,
  handleViewCurrentData,
  currentWeightsData,
  nextWeightsData,
  chartColors,
  textColors,
  lightColors,
  darkColors,
  viewCurrentData,
}: {
  isOpen: boolean
  handleClose: () => void
  handleViewCurrentData: (toggle: boolean) => void
  currentWeightsData: { name: string; value: number; usdValue: number }[]
  nextWeightsData: { name: string; value: number; usdValue: number }[]
  chartColors: string[]
  textColors: string[]
  lightColors: string[]
  darkColors: string[]
  viewCurrentData: boolean
}): JSX.Element => {
  const { isMobile } = useWindowDimensions()
  const [animate, setAnimate] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const searchedList = useMemo(() => {
    const dataToUse = viewCurrentData ? currentWeightsData : nextWeightsData
    return searchTerm ? dataToUse.filter((item) => item.name.includes(searchTerm.toLowerCase())) : dataToUse
  }, [searchTerm, currentWeightsData, nextWeightsData, viewCurrentData])

  const onAnimationStart = useCallback(() => {
    setTimeout(() => {
      setAnimate(false)
    }, 2000)
  }, [])

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
        <ResponsiveContainer width={!isMobile ? '60%' : '100%'} height={300}>
          <PieChart width={50}>
            <Pie
              isAnimationActive={animate}
              onAnimationStart={onAnimationStart}
              data={viewCurrentData ? currentWeightsData : nextWeightsData}
              cx="50%"
              cy="50%"
              outerRadius={'100%'}
              fill="#8884d8"
              dataKey="value"
            >
              {(viewCurrentData ? currentWeightsData : nextWeightsData).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index < chartColors.length ? chartColors[index] : darkColors[index % darkColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
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
                        color: index < textColors.length ? textColors[index] : darkColors[index % darkColors.length],
                      }}
                    >{`${entry.name}`}</Text>
                  </Flex>
                  <Text
                    bold
                    textAlignRight
                    style={{
                      color: index < textColors.length ? textColors[index] : darkColors[index % darkColors.length],
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
