import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { PortfolioAreaChart2 } from './PortfolioAreaChart2'
import { TokenWeights1 } from './TokenWeights1'
import AnalyticsCard from './components/AnalyticsCard'

import { Responsive, WidthProvider } from 'react-grid-layout'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { BKPT_5, BKPT_4, BKPT_2, BKPT_1 } from '../../constants'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function Analytics(): JSX.Element {
  return <AnalyticsContent />
}

export function AnalyticsContent(): JSX.Element {
  const { activeNetwork } = useNetwork()
  const { width } = useWindowDimensions()
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

  const rowHeight = 100
  const margin = 10

  const layoutLG = [
    { i: 'premiums', x: 0, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'uwpSize', x: 2, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'leverageFactor', x: 4, y: 0, w: 2, h: 1, isResizeable: false },
    { i: 'tokenTable', x: 0, y: 1, w: 4, h: 5, minH: 3, maxH: 5, minW: 3, maxW: 6 },
    { i: 'portfolioAreaChart', x: 0, y: 12, w: 6, h: 5 },
    { i: 'portfolioHistogram', x: 0, y: 20, w: 12, h: 5 },
    { i: 'tokenPriceVolatilityHistogram', x: 1, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'premiumsChart', x: 2, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
  ]

  const layoutMD = [
    { i: 'premiums', x: 0, y: 0, w: 2, h: 2 },
    { i: 'uwpSize', x: 2, y: 0, w: 2, h: 2 },
    { i: 'leverageFactor', x: 4, y: 0, w: 2, h: 2 },
    { i: 'tokenTable', x: 0, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
    { i: 'portfolioAreaChart', x: 2, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'portfolioHistogram', x: 0, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'tokenPriceVolatilityHistogram', x: 1, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'premiumsChart', x: 2, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
  ]

  const layoutSM = [
    { i: 'premiums', x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'uwpSize', x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'leverageFactor', x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'tokenTable', x: 0, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
    { i: 'portfolioAreaChart', x: 2, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'portfolioHistogram', x: 0, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'tokenPriceVolatilityHistogram', x: 1, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'premiumsChart', x: 2, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
  ]

  const layoutXS = [
    { i: 'premiums', x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'uwpSize', x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'leverageFactor', x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'tokenTable', x: 0, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
    { i: 'portfolioAreaChart', x: 2, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'portfolioHistogram', x: 0, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'tokenPriceVolatilityHistogram', x: 1, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'premiumsChart', x: 2, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
  ]

  const layoutXXS = [
    { i: 'premiums', x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'uwpSize', x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'leverageFactor', x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'tokenTable', x: 0, y: 1, w: 2, h: 1, minW: 2, minH: 1 },
    { i: 'portfolioAreaChart', x: 2, y: 1, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'portfolioHistogram', x: 0, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'tokenPriceVolatilityHistogram', x: 1, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
    { i: 'premiumsChart', x: 2, y: 2, w: 1, h: 1, minW: 1, minH: 1 },
  ]

  // original { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
  const breakpointsObj = { lg: BKPT_5, md: BKPT_4, sm: BKPT_2, xs: BKPT_1, xxs: 0 }

  const [currLayout, setCurrLayout] = useState(layoutLG)

  const handleLayoutChange = useCallback((layout) => {
    setCurrLayout(layout)
  }, [])

  useEffect(() => {
    if (width > breakpointsObj.lg) {
      setCurrLayout(layoutLG)
      return
    } else if (width > breakpointsObj.md) {
      setCurrLayout(layoutMD)
      return
    } else if (width > breakpointsObj.sm) {
      setCurrLayout(layoutSM)
      return
    } else if (width > breakpointsObj.xs) {
      setCurrLayout(layoutSM)
      return
    } else {
      setCurrLayout(layoutXXS)
    }
  }, [width])

  return (
    // <Flex col gap={16} py={16} px={10}>
    //   <Flex>
    //     <Flex gap={10}>
    //       <Card shadow widthP={100}>
    //         <Flex gap={8} col>
    //           <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
    //             Premiums
    //           </Text>
    //           <CardSectionValue info>${truncateValue(premiumsUSD, 2)}</CardSectionValue>
    //         </Flex>
    //       </Card>
    //       <Card shadow widthP={100}>
    //         <Flex gap={8} col>
    //           <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
    //             Underwriting Pool Size
    //           </Text>
    //           <CardSectionValue info>${truncateValue(formatUnits(uwpValueUSD, 18), 2)} </CardSectionValue>
    //         </Flex>
    //       </Card>
    //       <Card shadow widthP={100}>
    //         <Flex gap={8} col>
    //           <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
    //             Leverage Factor
    //           </Text>
    //           <CardSectionValue info>{leverageFactor}</CardSectionValue>
    //         </Flex>
    //       </Card>
    //     </Flex>
    //   </Flex>
    //   <Flex col gap={16}>
    //     <AnalyticsCard title="Underwriting Pool Composition" clarification="Data is delayed by up to 1 hour.">
    //       <TokenTable />
    //     </AnalyticsCard>
    //     <AnalyticsCard title="Portfolio Value" clarification="Data is delayed by up to 1 hour.">
    //       <PortfolioAreaChart2 />
    //     </AnalyticsCard>
    //     <AnalyticsCard
    //       title="Underwriting Pool Volatility"
    //       clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
    //     >
    //       <TokenPortfolioHistogram />
    //     </AnalyticsCard>
    //     <AnalyticsCard
    //       title="Token Price Volatility"
    //       clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
    //     >
    //       <TokenPriceVolatilityHistogram />
    //     </AnalyticsCard>
    //   </Flex>
    //   <Flex col gap={10}>
    //     <Text t2 semibold>
    //       Premiums Paid By Period
    //     </Text>
    //     <PremiumsPaidByPeriodChart />
    //   </Flex>
    // </Flex>
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layoutLG, md: layoutMD, sm: layoutSM, xs: layoutXS, xxs: layoutXXS }}
      breakpoints={breakpointsObj}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      margin={[margin, margin]}
      resizeHandles={['se']}
      rowHeight={rowHeight}
      compactType={'horizontal'}
      onLayoutChange={handleLayoutChange}
    >
      <div key={'premiums'}>
        <Card shadow height={(currLayout.find((layout) => layout.i == 'premiums')?.h ?? 0) * rowHeight - 32}>
          <Flex gap={8} col>
            <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
              Premiums
            </Text>
            <CardSectionValue info>${truncateValue(premiumsUSD, 2)}</CardSectionValue>
          </Flex>
        </Card>
      </div>
      <div key={'uwpSize'}>
        <Card shadow height={(currLayout.find((layout) => layout.i == 'uwpSize')?.h ?? 0) * rowHeight - 32}>
          <Flex gap={8} col>
            <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
              Underwriting Pool Size
            </Text>
            <CardSectionValue info>${truncateValue(formatUnits(uwpValueUSD, 18), 2)} </CardSectionValue>
          </Flex>
        </Card>
      </div>
      <div key={'leverageFactor'}>
        <Card shadow height={(currLayout.find((layout) => layout.i == 'leverageFactor')?.h ?? 0) * rowHeight - 32}>
          <Flex gap={8} col>
            <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
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
          height={
            rowHeight +
            ((currLayout.find((layout) => layout.i == 'tokenTable')?.h ?? 0) - 1) * (rowHeight + margin) -
            32
          }
        >
          <TokenTable
            chosenHeight={
              rowHeight +
              ((currLayout.find((layout) => layout.i == 'tokenTable')?.h ?? 0) - 1) * (rowHeight + margin) -
              32 -
              124
            }
          />
        </AnalyticsCard>
      </div>
      {/* <div key={'portfolioAreaChart'}>
        <AnalyticsCard title="Portfolio Value" clarification="Data is delayed by up to 1 hour.">
          <PortfolioAreaChart2 />
        </AnalyticsCard>
      </div>
      <div key={'portfolioHistogram'}>
        <AnalyticsCard
          title="Underwriting Pool Volatility"
          clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
        >
          <TokenPortfolioHistogram />
        </AnalyticsCard>
      </div> */}
    </ResponsiveGridLayout>
  )
}
