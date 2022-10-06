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
import { useGeneral } from '../../context/GeneralManager'

export const GaugePieChart = () => {
  const { appTheme } = useGeneral()
  const { gauges, intrface } = useVoteContext()
  const { gaugesLoading } = intrface
  const { isMobile } = useWindowDimensions()
  const { currentGaugesData, nextGaugesData, insuranceCapacity } = gauges

  const { width } = useWindowDimensions()

  const [openGaugeWeightsModal, setOpenGaugeWeightsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [animate, setAnimate] = useState(true)
  const [viewCurrentData, setViewCurrentData] = useState<boolean>(true)

  const CHART_COLORS = useMemo(() => ['rgb(212,120,216)', 'rgb(243,211,126)', 'rgb(95,93,249)', 'rgb(240,77,66)'], [])
  const LIGHT_COLORS = useMemo(() => ['rgb(212,120,216)', 'rgb(243,211,126)', '#6493fa', 'rgb(240,77,66)'], [])
  const DARK_COLORS = useMemo(() => ['rgb(182, 104, 185)', 'rgb(187, 136, 0)', 'rgb(95,93,249)', '#b83c33'], [])

  const TEXT_COLORS = useMemo(() => {
    if (appTheme === 'dark') {
      return LIGHT_COLORS
    }
    return DARK_COLORS
  }, [appTheme, LIGHT_COLORS, DARK_COLORS])

  const TOP_GAUGES = CHART_COLORS.length

  const currentData = useMemo(() => {
    return currentGaugesData
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
  }, [currentGaugesData, insuranceCapacity])

  const nextData = useMemo(() => {
    return nextGaugesData
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
  }, [nextGaugesData, insuranceCapacity])

  const summarizedData = useMemo(() => {
    const dataToUse = viewCurrentData ? currentData : nextData
    return [
      ...dataToUse.slice(0, TOP_GAUGES),
      {
        name: 'Other Protocols',
        value: dataToUse.slice(TOP_GAUGES).reduce((acc, pv) => pv.value + acc, 0),
        usdValue: dataToUse.slice(TOP_GAUGES).reduce((acc, pv) => pv.usdValue + acc, 0),
      },
    ]
  }, [currentData, nextData, TOP_GAUGES, viewCurrentData])

  const handleGaugeWeightsModal = useCallback(() => {
    setOpenGaugeWeightsModal(!openGaugeWeightsModal)
  }, [openGaugeWeightsModal])

  useEffect(() => {
    if (!gaugesLoading) {
      setTimeout(() => {
        setLoading(false)
      }, 2000)
    }
  }, [gaugesLoading])

  const onAnimationStart = useCallback(() => {
    setTimeout(() => {
      setAnimate(false)
    }, 2000)
  }, [])

  const handleViewCurrentData = useCallback((toggle: boolean) => {
    setViewCurrentData(toggle)
  }, [])

  return (
    <TileCard gap={20}>
      <GaugeWeightsModal
        isOpen={openGaugeWeightsModal}
        handleClose={handleGaugeWeightsModal}
        handleViewCurrentData={handleViewCurrentData}
        currentWeightsData={currentData}
        nextWeightsData={nextData}
        chartColors={CHART_COLORS}
        textColors={TEXT_COLORS}
        lightColors={LIGHT_COLORS}
        darkColors={DARK_COLORS}
        viewCurrentData={viewCurrentData}
      />
      <Flex between itemsCenter>
        <Text semibold t2_5>
          Gauge Weights
        </Text>
        <Button secondary techygradient noborder onClick={handleGaugeWeightsModal} disabled={loading} width={100}>
          See More
        </Button>
      </Flex>
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
          bgRaised={viewCurrentData}
          flex1
          onClick={() => setViewCurrentData(true)}
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
          bgRaised={!viewCurrentData}
          onClick={() => setViewCurrentData(false)}
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
                      fill={index == summarizedData.length - 1 ? '#DCDCDC' : CHART_COLORS[index % CHART_COLORS.length]}
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
                      style={{ color: index < TEXT_COLORS.length ? TEXT_COLORS[index] : 'inherit' }}
                    >{`${entry.name}`}</Text>
                  </Flex>
                  <Text
                    t4s
                    bold
                    textAlignRight
                    style={{ color: index < TEXT_COLORS.length ? TEXT_COLORS[index] : 'inherit' }}
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
