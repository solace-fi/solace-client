import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Button } from '../../components/atoms/Button'
import { Flex } from '../../components/atoms/Layout'
import { LoaderText } from '../../components/molecules/LoaderText'
import { TileCard } from '../../components/molecules/TileCard'
import { CustomPieChartTooltip, GaugeWeightsModal } from '../../components/organisms/GaugeWeightsModal'
import { BKPT_NAVBAR } from '../../constants'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from './VoteContext'
import { truncateValue } from '../../utils/formatting'

export const GaugePieChart = () => {
  const { gauges } = useVoteContext()
  const { isMobile } = useWindowDimensions()
  const { gaugesData, insuranceCapacity } = gauges

  const COLORS = useMemo(() => ['rgb(212,120,216)', 'rgb(243,211,126)', 'rgb(95,93,249)', 'rgb(240,77,66)'], [])
  const DARK_COLORS = useMemo(() => ['rgb(166, 95, 168)', 'rgb(187, 136, 0)', '#4644b9', '#b83c33'], [])

  const TOP_GAUGES = COLORS.length

  const data = useMemo(() => {
    return gaugesData
      .map((g) => {
        const v = parseFloat(formatUnits(g.gaugeWeight, 14).split('.')[0])
        return {
          name: g.gaugeName,
          value: v / 100,
          usdValue: (v * insuranceCapacity) / 10000,
          id: g.gaugeId,
          isActive: g.isActive,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [gaugesData, insuranceCapacity])

  const summarizedData = useMemo(
    () => [
      ...data.slice(0, TOP_GAUGES),
      {
        name: 'Other Protocols',
        value: data.slice(TOP_GAUGES).reduce((acc, pv) => pv.value + acc, 0),
        usdValue: data.slice(TOP_GAUGES).reduce((acc, pv) => pv.usdValue + acc, 0),
      },
    ],
    [data, TOP_GAUGES]
  )

  const { width } = useWindowDimensions()

  const [openGaugeWeightsModal, setOpenGaugeWeightsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [animate, setAnimate] = useState(true)

  const handleGaugeWeightsModal = useCallback(() => {
    setOpenGaugeWeightsModal(!openGaugeWeightsModal)
  }, [openGaugeWeightsModal])

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [])

  const onAnimationStart = useCallback(() => {
    setTimeout(() => {
      setAnimate(false)
    }, 2000)
  }, [])

  return (
    <TileCard gap={20}>
      <GaugeWeightsModal
        isOpen={openGaugeWeightsModal}
        handleClose={handleGaugeWeightsModal}
        data={data}
        colors={COLORS}
        darkColors={DARK_COLORS}
      />
      <Flex between itemsCenter>
        <Text semibold t2_5>
          Current Gauge Weights
        </Text>
        <Button secondary techygradient noborder onClick={handleGaugeWeightsModal} disabled={loading} width={100}>
          See More
        </Button>
      </Flex>
      <Flex justifyCenter>
        {loading ? (
          <LoaderText />
        ) : (
          <Flex col={isMobile} widthP={100}>
            <ResponsiveContainer width={!isMobile ? '60%' : '100%'} height={200}>
              <PieChart width={25}>
                <Pie
                  isAnimationActive={animate}
                  onAnimationStart={onAnimationStart}
                  data={summarizedData}
                  cx="50%"
                  cy="50%"
                  outerRadius={width > BKPT_NAVBAR ? '100%' : '80%'}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {summarizedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index == summarizedData.length - 1 ? '#DCDCDC' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Flex col gap={18} widthP={!isMobile ? 50 : 100}>
              {summarizedData.map((entry, index) => (
                <Flex key={`${entry.name}-${index}`} between gap={10}>
                  <Flex gap={10}>
                    {entry.name !== 'Other Protocols' && (
                      <img src={`https://assets.solace.fi/zapperLogos/${entry.name}`} height={24} />
                    )}
                    <Text
                      bold
                      t4s
                      textAlignLeft
                      style={{ color: index < COLORS.length ? COLORS[index] : 'inherit' }}
                    >{`${entry.name}`}</Text>
                  </Flex>
                  <Text
                    t4s
                    bold
                    textAlignRight
                    style={{ color: index < COLORS.length ? COLORS[index] : 'inherit' }}
                  >{`$${truncateValue(entry.usdValue, 2)}`}</Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
    </TileCard>
  )
}
