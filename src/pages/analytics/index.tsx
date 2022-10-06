import React, { useCallback, useMemo, useRef } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useAnalyticsContext } from './AnalyticsContext'
import { TokenPortfolioAreaChart } from './TokenPortfolioAreaChart'
import { TokenPortfolioHistogram } from './TokenPortfolioHistogram'
import { TokenPriceVolatilityHistogram } from './TokenPriceVolatilityHistogram'
// import { TokenPriceVolatilityCumm } from './TokenPriceVolatilityCumm'
import { Accordion } from '../../components/atoms/Accordion'
import { StyledHelpCircle } from '../../components/atoms/Icon'
import { TokenTable } from './TokenTable'
import { Card } from '../../components/atoms/Card'
import { useNetwork } from '../../context/NetworkManager'
import { truncateValue } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { TokenRadialChart } from './TokenRadialChart'
import { useVoteContext } from '../vote/VoteContext'
import CardSectionValue from '../lock/components/CardSectionValue'
import { PremiumsPaidByPeriodChart } from './PremiumsPaidByPeriodChart'
import { PortfolioAreaChartVega } from './PortfolioAreaChartVega'
import { TokenWeights } from './TokenWeights'
import AnalyticsCard from './components/AnalyticsCard'

import { Layout, Responsive, WidthProvider } from 'react-grid-layout'
import { BKPT_5, BKPT_4, BKPT_2, BKPT_1 } from '../../constants'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function Analytics(): JSX.Element {
  return <AnalyticsContent />
}

export function AnalyticsContent(): JSX.Element {
  const { activeNetwork } = useNetwork()
  const { data } = useAnalyticsContext()
  const { gauges } = useVoteContext()
  const { leverageFactor } = gauges
  const { fetchedPremiums, uwpValueUSD, fetchedSipMathLib } = data

  const premiumsUSD = useMemo(() => {
    if (!fetchedPremiums || !fetchedPremiums?.[activeNetwork.chainId]) return 0
    const premiumsByChainId = fetchedPremiums?.[activeNetwork.chainId]
    const latestEpoch = premiumsByChainId.history[premiumsByChainId.history.length - 1]
    return Number(latestEpoch.uweAmount) * Number(latestEpoch.uwpValuePerShare) * Number(latestEpoch.uwpPerUwe)
  }, [activeNetwork, fetchedPremiums])

  const ref = useRef<HTMLHeadingElement>(null)
  const rowHeight = 100
  const margin = 10
  const cardPadding = 32
  const titlePortion = 124

  const layoutLG = [
    { i: 'premiums', x: 0, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'uwpSize', x: 2, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'leverageFactor', x: 4, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'tokenTable', x: 0, y: 1, w: 4, h: 5, minH: 3, maxH: 6, minW: 3, maxW: 6 },
    { i: 'portfolioAreaChart', x: 4, y: 1, w: 8, h: 5, minH: 4, maxH: 10, minW: 3, maxW: 12 },
    { i: 'portfolioHistogram', x: 0, y: 6, w: 12, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 12 },
    { i: 'tokenPriceVolatilityHistogram', x: 0, y: 11, w: 12, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 12 },
    { i: 'tokenRadial', x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
    { i: 'tokenWeights', x: 3, y: 20, w: 9, h: 4, minW: 3, minH: 4, maxH: 10, maxW: 12 },
    { i: 'premiumsChart', x: 0, y: 24, w: 4, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 12 },
  ]

  const layoutMD = [
    { i: 'premiums', x: 0, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'uwpSize', x: 2, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'leverageFactor', x: 4, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'tokenTable', x: 0, y: 1, w: 4, h: 4, minH: 3, maxH: 6, minW: 3, maxW: 6 },
    { i: 'portfolioAreaChart', x: 4, y: 1, w: 6, h: 4, minH: 4, maxH: 10, minW: 3, maxW: 10 },
    { i: 'portfolioHistogram', x: 0, y: 6, w: 10, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 10 },
    { i: 'tokenPriceVolatilityHistogram', x: 0, y: 11, w: 10, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 10 },
    { i: 'tokenRadial', x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
    { i: 'tokenWeights', x: 3, y: 20, w: 7, h: 4, minW: 3, minH: 4, maxH: 10, maxW: 10 },
    { i: 'premiumsChart', x: 0, y: 24, w: 4, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 10 },
  ]

  const layoutSM = [
    { i: 'premiums', x: 0, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'uwpSize', x: 0, y: 1, w: 2, h: 1, isResizeable: false },
    { i: 'leverageFactor', x: 0, y: 2, w: 2, h: 1, isResizeable: false },
    { i: 'tokenTable', x: 2, y: 1, w: 4, h: 3, minH: 3, maxH: 6, minW: 3, maxW: 6 },
    { i: 'portfolioAreaChart', x: 4, y: 1, w: 6, h: 4, minH: 4, maxH: 10, minW: 3, maxW: 6 },
    { i: 'portfolioHistogram', x: 0, y: 6, w: 6, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 6 },
    { i: 'tokenPriceVolatilityHistogram', x: 0, y: 11, w: 6, h: 5, minH: 4, maxH: 10, minW: 4, maxW: 6 },
    { i: 'tokenRadial', x: 0, y: 16, w: 3, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 5 },
    { i: 'tokenWeights', x: 3, y: 16, w: 3, h: 4, minW: 3, minH: 4, maxH: 10, maxW: 6 },
    { i: 'premiumsChart', x: 0, y: 24, w: 6, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 6 },
  ]

  const layoutXS = [
    { i: 'premiums', x: 0, y: 0, w: 1, h: 1, isResizeable: false },
    { i: 'uwpSize', x: 0, y: 1, w: 1, h: 1, isResizeable: false },
    { i: 'leverageFactor', x: 0, y: 2, w: 1, h: 1, isResizeable: false },
    { i: 'tokenTable', x: 1, y: 1, w: 3, h: 3, minH: 3, maxH: 6, minW: 3, maxW: 4 },
    { i: 'portfolioAreaChart', x: 4, y: 1, w: 4, h: 4, minH: 4, maxH: 10, minW: 3, maxW: 4 },
    { i: 'portfolioHistogram', x: 0, y: 6, w: 4, h: 8, minH: 8, maxH: 10, minW: 4, maxW: 4 },
    { i: 'tokenPriceVolatilityHistogram', x: 0, y: 11, w: 4, h: 8, minH: 8, maxH: 10, minW: 4, maxW: 4 },
    { i: 'tokenRadial', x: 0, y: 16, w: 4, h: 4, minH: 4, maxH: 6, minW: 3, maxW: 4 },
    { i: 'tokenWeights', x: 0, y: 20, w: 4, h: 4, minW: 3, minH: 4, maxH: 10, maxW: 4 },
    { i: 'premiumsChart', x: 0, y: 24, w: 4, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 4 },
  ]

  const layoutXXS = [
    { i: 'premiums', x: 0, y: 1, w: 1, h: 1, isResizeable: false },
    { i: 'uwpSize', x: 0, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'leverageFactor', x: 1, y: 1, w: 1, h: 1, isResizeable: false },
    { i: 'tokenTable', x: 2, y: 1, w: 3, h: 5, minH: 3, maxH: 6, minW: 2, maxW: 2 },
    { i: 'portfolioAreaChart', x: 4, y: 1, w: 2, h: 7, minH: 7, maxH: 10, minW: 2, maxW: 2 },
    { i: 'portfolioHistogram', x: 0, y: 6, w: 2, h: 8, minH: 8, maxH: 10, minW: 2, maxW: 2 },
    { i: 'tokenPriceVolatilityHistogram', x: 0, y: 11, w: 2, h: 8, minH: 8, maxH: 10, minW: 2, maxW: 2 },
    { i: 'tokenRadial', x: 0, y: 16, w: 2, h: 4, minH: 4, maxH: 6, minW: 2, maxW: 2 },
    { i: 'tokenWeights', x: 0, y: 20, w: 2, h: 6, minW: 2, minH: 6, maxH: 10, maxW: 2 },
    { i: 'premiumsChart', x: 0, y: 24, w: 2, h: 4, minW: 2, minH: 2, maxH: 10, maxW: 2 },
  ]

  // original { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
  const breakpointsObj = { lg: BKPT_5, md: BKPT_4, sm: BKPT_2, xs: BKPT_1, xxs: 0 }
  const gridCols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

  const currLayouts = useRef<Layout[]>(layoutLG)

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    // some charts will change appearances based on the changed layout and might interfere with other charts, so we need to update them
    const adjustedLayout = layout
    for (let i = 0; i < layout.length; i++) {
      if (
        (layout[i].i === 'portfolioHistogram' || layout[i].i === 'tokenPriceVolatilityHistogram') &&
        layout[i].w <= 4
      ) {
        // the histograms will be height 8 when width is 4, then all other charts will be moved down by the diff
        const heightDiff = Math.max(8 - layout[i].h, 0)
        adjustedLayout[i].h += heightDiff
        for (let j = i + 1; j < layout.length; j++) {
          adjustedLayout[j].y += heightDiff
        }
      }
    }
    currLayouts.current = adjustedLayout
  }, [])

  const currLayoutsAt = useCallback(
    (i: string) => {
      const layout = currLayouts.current.find((l) => l.i === i)
      return (
        layout ?? {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          minW: 1,
          minH: 1,
        }
      )
    },
    [currLayouts]
  )

  return (
    <div ref={ref}>
      <ResponsiveGridLayout
        className="layout"
        draggableHandle=".dragHandle"
        layouts={{ lg: layoutLG, md: layoutMD, sm: layoutSM, xs: layoutXS, xxs: layoutXXS }}
        breakpoints={breakpointsObj}
        cols={gridCols}
        margin={[margin, margin]}
        resizeHandles={['se']}
        rowHeight={rowHeight}
        onLayoutChange={handleLayoutChange}
      >
        <div key={'premiums'}>
          <Card shadow height={currLayoutsAt('premiums').h * rowHeight - cardPadding} className="dragHandle">
            <Flex gap={8} col>
              <Text t6s semibold contrast>
                Premiums
              </Text>
              <CardSectionValue info>${truncateValue(premiumsUSD, 2)}</CardSectionValue>
            </Flex>
          </Card>
        </div>
        <div key={'uwpSize'}>
          <Card shadow height={currLayoutsAt('uwpSize').h * rowHeight - cardPadding} className="dragHandle">
            <Flex gap={8} col>
              <Text t6s semibold contrast>
                Underwriting Pool Size
              </Text>
              <CardSectionValue info>${truncateValue(formatUnits(uwpValueUSD, 18), 2)} </CardSectionValue>
            </Flex>
          </Card>
        </div>
        <div key={'leverageFactor'}>
          <Card shadow height={currLayoutsAt('leverageFactor').h * rowHeight - cardPadding} className="dragHandle">
            <Flex gap={8} col>
              <Text t6s semibold contrast>
                Leverage Factor
              </Text>
              <CardSectionValue info>{leverageFactor}</CardSectionValue>
            </Flex>
          </Card>
        </div>
        <div key={'tokenTable'}>
          <AnalyticsCard
            title="Underwriting Pool Composition"
            clarification="Data is delayed by up to 1 hour."
            height={rowHeight + (currLayoutsAt('tokenTable').h - 1) * (rowHeight + margin) - cardPadding}
          >
            <TokenTable
              chosenHeight={
                rowHeight + (currLayoutsAt('tokenTable').h - 1) * (rowHeight + margin) - cardPadding - titlePortion
              }
            />
          </AnalyticsCard>
        </div>
        <div key={'portfolioAreaChart'}>
          <AnalyticsCard
            title="Portfolio Value"
            clarification="Data is delayed by up to 1 hour."
            height={rowHeight + (currLayoutsAt('portfolioAreaChart').h - 1) * (rowHeight + margin) - cardPadding}
          >
            <PortfolioAreaChartVega
              chosenWidth={currLayoutsAt('portfolioAreaChart').w}
              chosenHeight={
                rowHeight +
                (currLayoutsAt('portfolioAreaChart').h - 1) * (rowHeight + margin) -
                cardPadding -
                titlePortion
              }
            />
          </AnalyticsCard>
        </div>
        <div key={'portfolioHistogram'}>
          <AnalyticsCard
            title="Underwriting Pool Volatility"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (currLayoutsAt('portfolioHistogram').h - 1) * (rowHeight + margin) - cardPadding}
          >
            <TokenPortfolioHistogram
              chosenWidth={currLayoutsAt('portfolioHistogram').w}
              chosenHeight={
                rowHeight +
                (currLayoutsAt('portfolioHistogram').h - 1) * (rowHeight + margin) -
                cardPadding -
                titlePortion
              }
            />
          </AnalyticsCard>
        </div>
        <div key={'tokenPriceVolatilityHistogram'}>
          <AnalyticsCard
            title="Token Price Volatility"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={
              rowHeight + (currLayoutsAt('tokenPriceVolatilityHistogram').h - 1) * (rowHeight + margin) - cardPadding
            }
          >
            <TokenPriceVolatilityHistogram
              chosenWidth={currLayoutsAt('tokenPriceVolatilityHistogram').w}
              chosenHeight={
                rowHeight +
                (currLayoutsAt('tokenPriceVolatilityHistogram').h - 1) * (rowHeight + margin) -
                cardPadding -
                titlePortion
              }
            />
          </AnalyticsCard>
        </div>
        <div key={'tokenRadial'}>
          <AnalyticsCard
            title="Token Price Volatility"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (currLayoutsAt('tokenRadial').h - 1) * (rowHeight + margin) - cardPadding}
          >
            <TokenRadialChart
              chosenWidth={currLayoutsAt('tokenRadial').w}
              chosenHeight={
                rowHeight + (currLayoutsAt('tokenRadial').h - 1) * (rowHeight + margin) - cardPadding - titlePortion
              }
            />
          </AnalyticsCard>
        </div>
        <div key={'tokenWeights'}>
          <AnalyticsCard
            title="Token Weights"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (currLayoutsAt('tokenWeights').h - 1) * (rowHeight + margin) - cardPadding}
          >
            <TokenWeights
              chosenWidth={currLayoutsAt('tokenWeights').w}
              chosenHeight={
                rowHeight + (currLayoutsAt('tokenWeights').h - 1) * (rowHeight + margin) - cardPadding - titlePortion
              }
            />
          </AnalyticsCard>
        </div>
        <div key={'premiumsChart'}>
          <AnalyticsCard
            title="Premiums Paid By Period"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (currLayoutsAt('premiumsChart').h - 1) * (rowHeight + margin) - cardPadding}
          >
            <PremiumsPaidByPeriodChart
              chosenWidth={currLayoutsAt('premiumsChart').w}
              chosenHeight={
                rowHeight + (currLayoutsAt('premiumsChart').h - 1) * (rowHeight + margin) - cardPadding - titlePortion
              }
            />
          </AnalyticsCard>
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}
