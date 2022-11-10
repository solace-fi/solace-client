import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Button } from '../../components/atoms/Button'
import { Flex } from '../../components/atoms/Layout'
import { LoaderText } from '../../components/molecules/LoaderText'
import { TileCard } from '../../components/molecules/TileCard'
import { GaugeWeightsModal } from '../../components/organisms/vote/GaugeWeightsModal'
import { Text } from '../../components/atoms/Typography'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from './VoteContext'
import { truncateValue } from '../../utils/formatting'
import { useGeneral } from '../../context/GeneralManager'
import vegaEmbed from 'vega-embed'

export const GaugePieChart = () => {
  const { appTheme } = useGeneral()
  const { gauges, intrface } = useVoteContext()
  const { gaugesLoading } = intrface
  const { isMobile } = useWindowDimensions()
  const { currentGaugesData, nextGaugesData, insuranceCapacity } = gauges

  const { width } = useWindowDimensions()

  const [openGaugeWeightsModal, setOpenGaugeWeightsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewCurrentData, setViewCurrentData] = useState<boolean>(true)

  const topColorTypes = ['top1', 'top2', 'top3', 'top4']
  const subColorTypes = ['sub1', 'sub2', 'sub3', 'sub4']

  const LIGHT_CHART_TOP_COLORS = useMemo(
    () => ['rgb(212,120,216)', 'rgb(243,211,126)', '#5d81f9', 'rgb(240,77,66)'],
    []
  )
  const DARK_CHART_TOP_COLORS = useMemo(
    () => ['rgb(182, 104, 185)', 'rgb(187, 136, 0)', 'rgb(95,93,249)', '#b83c33'],
    []
  )
  const LIGHT_TEXT_TOP_COLORS = useMemo(() => ['rgb(212,120,216)', 'rgb(243,211,126)', '#6493fa', 'rgb(240,77,66)'], [])
  const DARK_TEXT_TOP_COLORS = useMemo(
    () => ['rgb(182, 104, 185)', 'rgb(187, 136, 0)', 'rgb(95,93,249)', '#b83c33'],
    []
  )

  const LIGHT_CHART_SUB_COLORS = useMemo(() => ['#93e046', '#7f51fc', '#e89638', '#26ecbe'], [])
  const DARK_CHART_SUB_COLORS = useMemo(() => ['#6da832', '#5432b1', '#b8772c', '#1bb692'], [])
  const LIGHT_TEXT_SUB_COLORS = useMemo(() => ['#93e046', '#7f51fc', '#e89638', '#26ecbe'], [])
  const DARK_TEXT_SUB_COLORS = useMemo(() => ['#6da832', '#5432b1', '#b8772c', '#1bb692'], [])

  const TEXT_TOP_COLORS = useMemo(() => {
    if (appTheme === 'dark') {
      return LIGHT_TEXT_TOP_COLORS
    }
    return DARK_TEXT_TOP_COLORS
  }, [appTheme, LIGHT_TEXT_TOP_COLORS, DARK_TEXT_TOP_COLORS])

  const CHART_TOP_COLORS = useMemo(() => {
    if (appTheme === 'dark') {
      return LIGHT_CHART_TOP_COLORS
    }
    return DARK_CHART_TOP_COLORS
  }, [appTheme, LIGHT_CHART_TOP_COLORS, DARK_CHART_TOP_COLORS])

  const TEXT_SUB_COLORS = useMemo(() => {
    if (appTheme === 'dark') {
      return LIGHT_TEXT_SUB_COLORS
    }
    return DARK_TEXT_SUB_COLORS
  }, [appTheme, LIGHT_TEXT_SUB_COLORS, DARK_TEXT_SUB_COLORS])

  const CHART_SUB_COLORS = useMemo(() => {
    if (appTheme === 'dark') {
      return LIGHT_CHART_SUB_COLORS
    }
    return DARK_CHART_SUB_COLORS
  }, [appTheme, LIGHT_CHART_SUB_COLORS, DARK_CHART_SUB_COLORS])

  const TOP_GAUGES = TEXT_TOP_COLORS.length

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

  const handleViewCurrentData = useCallback((toggle: boolean) => {
    setViewCurrentData(toggle)
  }, [])

  function fetchVega(theme: 'light' | 'dark') {
    vegaEmbed('#gauge-weights-pie', {
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
        values: summarizedData.map((item: any, i) => {
          return {
            name: item.name,
            value: item.value / 100,
            usdValue: item.usdValue,
            colorType: i < topColorTypes.length ? topColorTypes[i] : 'other',
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
            domain: [...topColorTypes, ...subColorTypes, 'other'],
            range: [...CHART_TOP_COLORS, ...CHART_SUB_COLORS, '#DCDCDC'],
          },
        },
        order: { field: 'index', type: 'quantitative', sort: 'ascending' },
      },
    })
  }

  useEffect(() => {
    if (loading || openGaugeWeightsModal) return
    fetchVega(appTheme)
  }, [openGaugeWeightsModal, width, appTheme, currentData, nextData, viewCurrentData, loading])

  return (
    <TileCard gap={20}>
      <GaugeWeightsModal
        isOpen={openGaugeWeightsModal}
        handleClose={handleGaugeWeightsModal}
        handleViewCurrentData={handleViewCurrentData}
        currentWeightsData={currentData}
        nextWeightsData={nextData}
        chartTopColors={CHART_TOP_COLORS}
        textTopColors={TEXT_TOP_COLORS}
        chartSubColors={CHART_SUB_COLORS}
        textSubColors={TEXT_SUB_COLORS}
        topColorTypes={topColorTypes}
        subColorTypes={subColorTypes}
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
        {loading || openGaugeWeightsModal ? (
          <LoaderText />
        ) : (
          <Flex col={isMobile} widthP={100}>
            <Flex id="gauge-weights-pie" width={400} widthP={isMobile ? 100 : undefined} justifyCenter>
              <Text autoAlign>data not available</Text>
            </Flex>
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
                      style={{ color: index < TEXT_TOP_COLORS.length ? TEXT_TOP_COLORS[index] : 'inherit' }}
                    >{`${entry.name}`}</Text>
                  </Flex>
                  <Text
                    t4s
                    bold
                    textAlignRight
                    style={{ color: index < TEXT_TOP_COLORS.length ? TEXT_TOP_COLORS[index] : 'inherit' }}
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
