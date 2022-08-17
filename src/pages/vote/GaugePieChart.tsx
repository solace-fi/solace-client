import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Button } from '../../components/atoms/Button'
import { Flex } from '../../components/atoms/Layout'
import { LoaderText } from '../../components/molecules/LoaderText'
import { TileCard } from '../../components/molecules/TileCard'
import { CustomPieChartTooltip, GaugeWeightsModal } from '../../components/organisms/GaugeWeightsModal'
import { BKPT_NAVBAR } from '../../constants'
import { Text } from '../../components/atoms/Typography'
import { BigNumber } from '@solace-fi/sdk-nightly'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from './VoteContext'

export const GaugePieChart = () => {
  const { gauges } = useVoteContext()
  const { gaugesData } = gauges

  const COLORS = useMemo(() => ['rgb(212,120,216)', 'rgb(243,211,126)', 'rgb(95,93,249)', 'rgb(240,77,66)'], [])
  const DARK_COLORS = useMemo(() => ['rgb(166, 95, 168)', 'rgb(187, 136, 0)', '#4644b9', '#b83c33'], [])

  const TOP_GAUGES = COLORS.length

  // const data = useMemo(
  //   () => [
  //     { name: 'stake-dao', value: 18, gaugeId: BigNumber.from(1), isActive: true },
  //     { name: 'aave', value: 16, gaugeId: BigNumber.from(2), isActive: true },
  //     { name: 'compound', value: 15, gaugeId: BigNumber.from(3), isActive: true },
  //     { name: 'solace', value: 13, gaugeId: BigNumber.from(4), isActive: true },
  //     { name: 'sushiswap', value: 12, gaugeId: BigNumber.from(5), isActive: true },
  //     { name: 'fox-bank', value: 10, gaugeId: BigNumber.from(6), isActive: true },
  //     { name: 'monkey-barrel', value: 9, gaugeId: BigNumber.from(7), isActive: true },
  //     { name: 'nexus-farm', value: 4, gaugeId: BigNumber.from(8), isActive: true },
  //     { name: 'quickswap', value: 2, gaugeId: BigNumber.from(9), isActive: true },
  //     { name: 'lemonade-stake', value: 1, gaugeId: BigNumber.from(10), isActive: true },
  //   ],
  //   []
  // )

  const data = useMemo(() => {
    return gaugesData.map((g) => {
      return {
        name: g.gaugeName,
        value: parseFloat(formatUnits(g.gaugeWeight, 14).split('.')[0]) / 100,
        id: g.gaugeId,
        isActive: g.isActive,
      }
    })
  }, [gaugesData])

  const summarizedData = useMemo(
    () => [
      ...data.slice(0, TOP_GAUGES),
      { name: 'Other Protocols', value: data.slice(TOP_GAUGES).reduce((acc, pv) => pv.value + acc, 0) },
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
      <Flex between>
        <Text semibold t2>
          Current Gauge Weights
        </Text>
        <Button secondary techygradient noborder onClick={handleGaugeWeightsModal} disabled={loading}>
          See More
        </Button>
      </Flex>
      <Flex justifyCenter>
        {loading ? (
          <LoaderText />
        ) : (
          <>
            <ResponsiveContainer width="60%" height={200}>
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
            <Flex col gap={18} widthP={50}>
              {summarizedData.map((entry, index) => (
                <Flex key={`${entry.name}-${index}`} between>
                  <Text
                    bold
                    textAlignLeft
                    style={{ color: index < COLORS.length ? COLORS[index] : 'inherit' }}
                  >{`${entry.name}`}</Text>
                  <Text bold textAlignRight>{`${entry.value}%`}</Text>
                </Flex>
              ))}
            </Flex>
          </>
        )}
      </Flex>
    </TileCard>
  )
}
