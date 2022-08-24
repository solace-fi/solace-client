import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, TooltipProps } from 'recharts'

import { Flex, VerticalSeparator } from '../atoms/Layout'
import { Text } from '../atoms/Typography'
import { LoaderText } from '../molecules/LoaderText'
import { BKPT_NAVBAR } from '../../constants'
import { useGeneral } from '../../context/GeneralManager'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { Modal } from '../molecules/Modal'
import { Accordion } from '../atoms/Accordion'
import { SmallerInputSection } from '../molecules/InputSection'

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
  data,
  colors,
  darkColors,
}: {
  isOpen: boolean
  handleClose: () => void
  data: { name: string; value: number }[]
  colors: string[]
  darkColors: string[]
}): JSX.Element => {
  const { isMobile } = useWindowDimensions()
  const [animate, setAnimate] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const searchedList = useMemo(
    () => (searchTerm ? data.filter((item) => item.name.includes(searchTerm.toLowerCase())) : data),
    [searchTerm, data]
  )

  const onAnimationStart = useCallback(() => {
    setTimeout(() => {
      setAnimate(false)
    }, 2000)
  }, [])

  return (
    <Modal modalTitle="Current Gauge Weights" isOpen={isOpen} handleClose={handleClose}>
      <Flex col={isMobile} row={!isMobile} gap={10} bgSecondary rounded p={12}>
        <ResponsiveContainer width={!isMobile ? '60%' : '100%'} height={300}>
          <PieChart width={50}>
            <Pie
              isAnimationActive={animate}
              onAnimationStart={onAnimationStart}
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={'100%'}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index < colors.length ? colors[index] : darkColors[index % darkColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <Flex col gap={10}>
          {' '}
          {/**bgSecondary p={12} rounded */}
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
                <Flex key={`${entry.name}-${index}`} between px={10} py={4} gap={5}>
                  <Text
                    bold
                    textAlignLeft
                    style={{ color: index < colors.length ? colors[index] : darkColors[index % darkColors.length] }}
                  >{`${entry.name}`}</Text>
                  <Text bold textAlignRight>{`${entry.value}%`}</Text>
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
