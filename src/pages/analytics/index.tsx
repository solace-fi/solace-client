import React, { useCallback, useRef, useState } from 'react'

import { useAnalyticsContext } from './AnalyticsContext'
import { TokenPortfolioHistogram } from './TokenPortfolioHistogram'
import { TokenPriceVolatilityHistogram } from './TokenPriceVolatilityHistogram'
// import { TokenPriceVolatilityCumm } from './TokenPriceVolatilityCumm'
import { TokenTable } from './TokenTable'
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
  MAX_EXPOSURE_STAT,
  TOKEN_COMPOSITION_TABLE,
  PORTFOLIO_AREA_CHART,
  PORTFOLIO_VOL_HISTOGRAM,
  TOKEN_PRICE_VOL_HISTOGRAM,
  TOKEN_RADIAL_PIE_CHART,
  TOKEN_WEIGHTS_AREA_CHART,
  PREMIUMS_LINE_CHART,
  SPI_EXPOSURES_TABLE_APPID,
  SPI_EXPOSURES_TABLE_POLICY,
  COVER_LIMIT_PER_CATEGORY_PIE_CHART,
  GAUGE_OVERVIEW_TABLE,
  STAKING_LOCK_BURNDOWN_AREA_CHART_ETHMAIN,
  STAKING_LOCK_BURNDOWN_AREA_CHART_POLYGON,
  STAKING_LOCK_BURNDOWN_AREA_CHART_FANTOM,
  STAKING_LOCK_BURNDOWN_AREA_CHART_AURORA,
} = AnalyticsChart

import { Layout, Responsive, WidthProvider } from 'react-grid-layout'
import {
  layoutLG,
  layoutMD,
  layoutSM,
  layoutXS,
  layoutXXS,
  breakpointsObj,
  cols,
  margin,
  rowHeight,
  cardPadding,
  cardUnchartable,
  interval,
} from './constants'
import { SpiExposuresTableByAppId } from './SpiExposure/SpiExposuresTableByAppId'
import { SpiExposuresTableByPolicy } from './SpiExposure/SpiExposuresTableByPolicy'
import { CoverLimitCategoryPieChart } from './CoverLimitPerCategoryPieChart'
import { GaugeOverviewTable } from './GaugeOverviewTable'
import { XsLockerAreaChart } from './XsLockerAreaChart'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function Analytics(): JSX.Element {
  return <AnalyticsContent />
}

export function AnalyticsContent(): JSX.Element {
  const { data } = useAnalyticsContext()
  const { gauges } = useVoteContext()
  const { leverageFactor } = gauges
  const { premiumsUSD, uwpValueUSD, fetchedSipMathLib, protocolExposureData } = data

  const [numCols, setNumCols] = useState(cols.lg)

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
    <div>
      <ResponsiveGridLayout
        className="layout"
        draggableHandle=".dragHandle"
        layouts={{ lg: layoutLG, md: layoutMD, sm: layoutSM, xs: layoutXS, xxs: layoutXXS }}
        breakpoints={breakpointsObj}
        cols={cols}
        margin={[margin, margin]}
        resizeHandles={['se']}
        rowHeight={rowHeight}
        onLayoutChange={handleLayoutChange}
      >
        <div key={PREMIUMS_STAT}>
          <AnalyticsCard title="Premiums" height={rowHeight + (at(PREMIUMS_STAT).h - 1) * interval - cardPadding}>
            <CardSectionValue info>${truncateValue(premiumsUSD, 2)}</CardSectionValue>
          </AnalyticsCard>
        </div>

        <div key={UWP_SIZE_STAT}>
          <AnalyticsCard
            title="Underwriting Pool Size"
            height={rowHeight + (at(UWP_SIZE_STAT).h - 1) * interval - cardPadding}
          >
            <CardSectionValue info>${truncateValue(formatUnits(uwpValueUSD, 18), 2)} </CardSectionValue>
          </AnalyticsCard>
        </div>

        <div key={LEVERAGE_FACTOR_STAT}>
          <AnalyticsCard
            title="Leverage Factor"
            height={rowHeight + (at(LEVERAGE_FACTOR_STAT).h - 1) * interval - cardPadding}
          >
            <CardSectionValue info>{leverageFactor}</CardSectionValue>
          </AnalyticsCard>
        </div>
        <div key={MAX_EXPOSURE_STAT}>
          <AnalyticsCard
            title="Max Protocol Exposure"
            height={rowHeight + (at(MAX_EXPOSURE_STAT).h - 1) * interval - cardPadding}
          >
            <CardSectionValue info>
              $
              {truncateValue(
                protocolExposureData.length > 0
                  ? Math.max(...protocolExposureData.map((data) => data.totalExposure))
                  : 0,
                2
              )}
            </CardSectionValue>
          </AnalyticsCard>
        </div>
        <div key={TOKEN_COMPOSITION_TABLE}>
          <AnalyticsCard
            title="Underwriting Pool Composition"
            clarification="Data is delayed by up to 1 hour."
            height={rowHeight + (at(TOKEN_COMPOSITION_TABLE).h - 1) * interval - cardPadding}
          >
            <TokenTable chosenHeightPx={rowHeight + (at(TOKEN_COMPOSITION_TABLE).h - 1) * interval - cardUnchartable} />
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
              chosenHeightPx={rowHeight + (at(PORTFOLIO_AREA_CHART).h - 1) * interval - cardUnchartable}
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
              chosenHeightPx={rowHeight + (at(PORTFOLIO_VOL_HISTOGRAM).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={TOKEN_PRICE_VOL_HISTOGRAM}>
          <AnalyticsCard
            title="Token Price Volatility Histogram"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (at(TOKEN_PRICE_VOL_HISTOGRAM).h - 1) * interval - cardPadding}
          >
            <TokenPriceVolatilityHistogram
              chosenWidth={at(TOKEN_PRICE_VOL_HISTOGRAM).w}
              chosenHeightPx={rowHeight + (at(TOKEN_PRICE_VOL_HISTOGRAM).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={TOKEN_RADIAL_PIE_CHART}>
          <AnalyticsCard
            title="Token Price Volatility Pie"
            clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
            height={rowHeight + (at(TOKEN_RADIAL_PIE_CHART).h - 1) * interval - cardPadding}
          >
            <TokenRadialChart
              chosenWidth={at(TOKEN_RADIAL_PIE_CHART).w}
              chosenHeightPx={rowHeight + (at(TOKEN_RADIAL_PIE_CHART).h - 1) * interval - cardUnchartable}
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
              chosenHeightPx={rowHeight + (at(TOKEN_WEIGHTS_AREA_CHART).h - 1) * interval - cardUnchartable}
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
              chosenHeightPx={rowHeight + (at(PREMIUMS_LINE_CHART).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={SPI_EXPOSURES_TABLE_APPID}>
          <AnalyticsCard
            title="Portfolio Insurance Exposures By Protocol"
            clarification={``}
            height={rowHeight + (at(SPI_EXPOSURES_TABLE_APPID).h - 1) * interval - cardPadding}
          >
            <SpiExposuresTableByAppId
              chosenHeightPx={rowHeight + (at(SPI_EXPOSURES_TABLE_APPID).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={SPI_EXPOSURES_TABLE_POLICY}>
          <AnalyticsCard
            title="Portfolio Insurance Exposures By Policy"
            clarification={``}
            height={rowHeight + (at(SPI_EXPOSURES_TABLE_POLICY).h - 1) * interval - cardPadding}
          >
            <SpiExposuresTableByPolicy
              chosenHeightPx={rowHeight + (at(SPI_EXPOSURES_TABLE_POLICY).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={COVER_LIMIT_PER_CATEGORY_PIE_CHART}>
          <AnalyticsCard
            title="Balance Per Category"
            clarification={``}
            height={rowHeight + (at(COVER_LIMIT_PER_CATEGORY_PIE_CHART).h - 1) * interval - cardPadding}
          >
            <CoverLimitCategoryPieChart
              chosenWidth={at(COVER_LIMIT_PER_CATEGORY_PIE_CHART).w}
              chosenHeightPx={rowHeight + (at(COVER_LIMIT_PER_CATEGORY_PIE_CHART).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={GAUGE_OVERVIEW_TABLE}>
          <AnalyticsCard
            title="Gauge Overview"
            height={rowHeight + (at(GAUGE_OVERVIEW_TABLE).h - 1) * interval - cardPadding}
          >
            <GaugeOverviewTable
              chosenHeightPx={rowHeight + (at(GAUGE_OVERVIEW_TABLE).h - 1) * interval - cardUnchartable}
            />
          </AnalyticsCard>
        </div>
        <div key={STAKING_LOCK_BURNDOWN_AREA_CHART_ETHMAIN}>
          <AnalyticsCard
            title="Staked Solace Burndown (Ethereum Mainnet)"
            height={rowHeight + (at(STAKING_LOCK_BURNDOWN_AREA_CHART_ETHMAIN).h - 1) * interval - cardPadding}
          >
            <XsLockerAreaChart
              chosenWidth={at(STAKING_LOCK_BURNDOWN_AREA_CHART_ETHMAIN).w}
              chosenHeightPx={
                rowHeight + (at(STAKING_LOCK_BURNDOWN_AREA_CHART_ETHMAIN).h - 1) * interval - cardUnchartable
              }
              chainId={1}
            />
          </AnalyticsCard>
        </div>
        <div key={STAKING_LOCK_BURNDOWN_AREA_CHART_POLYGON}>
          <AnalyticsCard
            title="Staked Solace Burndown (Polygon)"
            height={rowHeight + (at(STAKING_LOCK_BURNDOWN_AREA_CHART_POLYGON).h - 1) * interval - cardPadding}
          >
            <XsLockerAreaChart
              chosenWidth={at(STAKING_LOCK_BURNDOWN_AREA_CHART_POLYGON).w}
              chosenHeightPx={
                rowHeight + (at(STAKING_LOCK_BURNDOWN_AREA_CHART_POLYGON).h - 1) * interval - cardUnchartable
              }
              chainId={137}
            />
          </AnalyticsCard>
        </div>
        <div key={STAKING_LOCK_BURNDOWN_AREA_CHART_FANTOM}>
          <AnalyticsCard
            title="Staked Solace Burndown (Fantom)"
            height={rowHeight + (at(STAKING_LOCK_BURNDOWN_AREA_CHART_FANTOM).h - 1) * interval - cardPadding}
          >
            <XsLockerAreaChart
              chosenWidth={at(STAKING_LOCK_BURNDOWN_AREA_CHART_FANTOM).w}
              chosenHeightPx={
                rowHeight + (at(STAKING_LOCK_BURNDOWN_AREA_CHART_FANTOM).h - 1) * interval - cardUnchartable
              }
              chainId={250}
            />
          </AnalyticsCard>
        </div>
        <div key={STAKING_LOCK_BURNDOWN_AREA_CHART_AURORA}>
          <AnalyticsCard
            title="Staked Solace Burndown (Aurora)"
            height={rowHeight + (at(STAKING_LOCK_BURNDOWN_AREA_CHART_AURORA).h - 1) * interval - cardPadding}
          >
            <XsLockerAreaChart
              chosenWidth={at(STAKING_LOCK_BURNDOWN_AREA_CHART_AURORA).w}
              chosenHeightPx={
                rowHeight + (at(STAKING_LOCK_BURNDOWN_AREA_CHART_AURORA).h - 1) * interval - cardUnchartable
              }
              chainId={1313161554}
            />
          </AnalyticsCard>
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}
