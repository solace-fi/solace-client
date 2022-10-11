import React, { useCallback, useRef } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useAnalyticsContext } from './AnalyticsContext'
import { TokenPortfolioHistogram } from './TokenPortfolioHistogram'
import { TokenPriceVolatilityHistogram } from './TokenPriceVolatilityHistogram'
// import { TokenPriceVolatilityCumm } from './TokenPriceVolatilityCumm'
import { TokenTable } from './TokenTable'
import { Card } from '../../components/atoms/Card'
import { truncateValue } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { TokenRadialChart } from './TokenRadialChart'
import { useVoteContext } from '../vote/VoteContext'
import CardSectionValue from '../../components/molecules/stake-and-lock/CardSectionValue'
import { PremiumsPaidByPeriodChart } from './PremiumsPaidByPeriodChart'
import { PortfolioAreaChartVega } from './PortfolioAreaChartVega'
import { TokenWeights } from './TokenWeights'
import AnalyticsCard from './components/AnalyticsCard'
import { AnalyticsChart } from '../../constants/enums/analytics'

const {
  PREMIUMS_STAT,
  UWP_SIZE_STAT,
  LEVERAGE_FACTOR_STAT,
  TOKEN_COMPOSITION_TABLE,
  PORTFOLIO_AREA_CHART,
  PORTFOLIO_VOL_HISTOGRAM,
  TOKEN_PRICE_VOL_HISTOGRAM,
  TOKEN_RADIAL_PIE_CHART,
  TOKEN_WEIGHTS_AREA_CHART,
  PREMIUMS_LINE_CHART,
  SPI_EXPOSURES_TABLE,
} = AnalyticsChart

import { Layout, Responsive, WidthProvider } from 'react-grid-layout'
import {
  layoutLG,
  layoutMD,
  layoutSM,
  layoutXS,
  layoutXXS,
  breakpointsObj,
  gridCols,
  margin,
  rowHeight,
  cardPadding,
  cardUnchartable,
  interval,
} from './constants'
import { SpiExposuresTable } from './SpiExposuresTable'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function Analytics(): JSX.Element {
  return <AnalyticsContent />
}

export function AnalyticsContent(): JSX.Element {
  const { data } = useAnalyticsContext()
  const { gauges } = useVoteContext()
  const { leverageFactor } = gauges
  const { premiumsUSD, uwpValueUSD, fetchedSipMathLib } = data

  const ref = useRef<HTMLHeadingElement>(null)

  const currLayouts = useRef<Layout[]>(layoutLG)

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    // some charts will change appearances based on the changed layout and might interfere with other charts, so we need to update them
    const adjustedLayout = layout
    for (let i = 0; i < layout.length; i++) {
      if ((layout[i].i === PORTFOLIO_VOL_HISTOGRAM || layout[i].i === TOKEN_PRICE_VOL_HISTOGRAM) && layout[i].w <= 4) {
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

  const at = useCallback(
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
        <div key={PREMIUMS_STAT}>
          <Card shadow height={at(PREMIUMS_STAT).h * rowHeight - cardPadding} className="dragHandle">
            <Flex gap={8} col>
              <Text t6s semibold contrast>
                Premiums
              </Text>
              <CardSectionValue info>${truncateValue(premiumsUSD, 2)}</CardSectionValue>
            </Flex>
          </Card>
        </div>
        <div key={UWP_SIZE_STAT}>
          <Card shadow height={at(UWP_SIZE_STAT).h * rowHeight - cardPadding} className="dragHandle">
            <Flex gap={8} col>
              <Text t6s semibold contrast>
                Underwriting Pool Size
              </Text>
              <CardSectionValue info>${truncateValue(formatUnits(uwpValueUSD, 18), 2)} </CardSectionValue>
            </Flex>
          </Card>
        </div>
        <div key={LEVERAGE_FACTOR_STAT}>
          <Card shadow height={at(LEVERAGE_FACTOR_STAT).h * rowHeight - cardPadding} className="dragHandle">
            <Flex gap={8} col>
              <Text t6s semibold contrast>
                Leverage Factor
              </Text>
              <CardSectionValue info>{leverageFactor}</CardSectionValue>
            </Flex>
          </Card>
        </div>
        <div key={TOKEN_COMPOSITION_TABLE}>
          <AnalyticsCard
            title="Underwriting Pool Composition"
            clarification="Data is delayed by up to 1 hour."
            height={rowHeight + (at(TOKEN_COMPOSITION_TABLE).h - 1) * interval - cardPadding}
          >
            <TokenTable chosenHeight={rowHeight + (at(TOKEN_COMPOSITION_TABLE).h - 1) * interval - cardUnchartable} />
          </AnalyticsCard>
        </div>
        <div key={PORTFOLIO_AREA_CHART}>
          <AnalyticsCard
            title="Portfolio Value"
            clarification="Data is delayed by up to 1 hour."
            height={rowHeight + (at(PORTFOLIO_AREA_CHART).h - 1) * interval - cardPadding}
          >
            <PortfolioAreaChartVega
              chosenWidth={at(PORTFOLIO_AREA_CHART).w}
              chosenHeight={rowHeight + (at(PORTFOLIO_AREA_CHART).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={PORTFOLIO_VOL_HISTOGRAM}>
          <AnalyticsCard
            title="Underwriting Pool Volatility"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (at(PORTFOLIO_VOL_HISTOGRAM).h - 1) * interval - cardPadding}
          >
            <TokenPortfolioHistogram
              chosenWidth={at(PORTFOLIO_VOL_HISTOGRAM).w}
              chosenHeight={rowHeight + (at(PORTFOLIO_VOL_HISTOGRAM).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={TOKEN_PRICE_VOL_HISTOGRAM}>
          <AnalyticsCard
            title="Token Price Volatility"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (at(TOKEN_PRICE_VOL_HISTOGRAM).h - 1) * interval - cardPadding}
          >
            <TokenPriceVolatilityHistogram
              chosenWidth={at(TOKEN_PRICE_VOL_HISTOGRAM).w}
              chosenHeight={rowHeight + (at(TOKEN_PRICE_VOL_HISTOGRAM).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={TOKEN_RADIAL_PIE_CHART}>
          <AnalyticsCard
            title="Token Price Volatility"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (at(TOKEN_RADIAL_PIE_CHART).h - 1) * interval - cardPadding}
          >
            <TokenRadialChart
              chosenWidth={at(TOKEN_RADIAL_PIE_CHART).w}
              chosenHeight={rowHeight + (at(TOKEN_RADIAL_PIE_CHART).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={TOKEN_WEIGHTS_AREA_CHART}>
          <AnalyticsCard
            title="Token Weights"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (at(TOKEN_WEIGHTS_AREA_CHART).h - 1) * interval - cardPadding}
          >
            <TokenWeights
              chosenWidth={at(TOKEN_WEIGHTS_AREA_CHART).w}
              chosenHeight={rowHeight + (at(TOKEN_WEIGHTS_AREA_CHART).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={PREMIUMS_LINE_CHART}>
          <AnalyticsCard
            title="Premiums Paid By Period"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (at(PREMIUMS_LINE_CHART).h - 1) * interval - cardPadding}
          >
            <PremiumsPaidByPeriodChart
              chosenWidth={at(PREMIUMS_LINE_CHART).w}
              chosenHeight={rowHeight + (at(PREMIUMS_LINE_CHART).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={SPI_EXPOSURES_TABLE}>
          <AnalyticsCard
            title="Portfolio Insurance Exposures"
            clarification={``}
            height={rowHeight + (at(SPI_EXPOSURES_TABLE).h - 1) * interval - cardPadding}
          >
            <SpiExposuresTable
              chosenHeight={rowHeight + (at(SPI_EXPOSURES_TABLE).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}
