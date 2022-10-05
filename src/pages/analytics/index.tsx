import React, { useMemo, useState } from 'react'
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

  return (
    <Flex col gap={16} py={16} px={10}>
      <Flex>
        <Flex gap={16}>
          <Card shadow widthP={100}>
            <Flex gap={8} col>
              <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
                Premiums
              </Text>
              <CardSectionValue info>${truncateValue(premiumsUSD, 2)}</CardSectionValue>
            </Flex>
          </Card>
          <Card shadow widthP={100}>
            <Flex gap={8} col>
              <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
                Underwriting Pool Size
              </Text>
              <CardSectionValue info>${truncateValue(formatUnits(uwpValueUSD, 18), 2)} </CardSectionValue>
            </Flex>
          </Card>
          <Card shadow widthP={100}>
            <Flex gap={8} col>
              <Text t6s semibold contrast style={{ whiteSpace: 'nowrap' }}>
                Leverage Factor
              </Text>
              <CardSectionValue info>{leverageFactor}</CardSectionValue>
            </Flex>
          </Card>
        </Flex>
      </Flex>
      <Flex col gap={16}>
        <AnalyticsCard title="Underwriting Pool Composition" clarification="Data is delayed by up to 1 hour.">
          <TokenTable />
        </AnalyticsCard>
        <AnalyticsCard title="Portfolio Value" clarification="Data is delayed by up to 1 hour.">
          <PortfolioAreaChart2 />
        </AnalyticsCard>
        <AnalyticsCard
          title="Underwriting Pool Volatility"
          clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
        >
          <TokenPortfolioHistogram />
        </AnalyticsCard>
        <AnalyticsCard
          title="Token Price Volatility"
          clarification={`Data from the last ${fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.`}
        >
          <TokenPriceVolatilityHistogram />
        </AnalyticsCard>
        {/* <AnalyticsCard /> */}
      </Flex>
      {/* <Flex col gap={10}>
        <Flex itemsCenter gap={10}>
          <Text t2 semibold>
            Underwriting Pool Composition
          </Text>
          <Text autoAlignVertical>
            <StyledHelpCircle
              size={25}
              onClick={() => setUpcText(!upcText)}
              style={{
                cursor: 'pointer',
              }}
            />
          </Text>
        </Flex>
        <Accordion isOpen={upcText} p={upcText ? 5 : 0} noScroll>
          <Flex p={8}>
            <Text>Data is delayed by up to 1 hour.</Text>
          </Flex>
        </Accordion>
        <TokenTable />
      </Flex> */}
      {/* <Flex col gap={10}>
        <Flex itemsCenter gap={10}>
          <Text t2 semibold>
            Underwriting Pool Value (USD)
          </Text>
          <Text autoAlignVertical>
            <StyledHelpCircle
              size={25}
              onClick={() => setUpValueText(!upValueText)}
              style={{
                cursor: 'pointer',
              }}
            />
          </Text>
        </Flex>
        <Accordion isOpen={upValueText} p={upValueText ? 5 : 0} noScroll>
          <Flex p={8}>
            <Text>Data is delayed by up to 1 hour.</Text>
          </Flex>
        </Accordion>
        <TokenPortfolioAreaChart />
        <PortfolioAreaChart2 />
        <TokenWeights1 />
      </Flex> */}
      {/* <Flex col gap={10}>
        <Flex gap={10}>
          <Text t2 semibold>
            Underwriting Pool Volatility
          </Text>
          <Text autoAlignVertical>
            <StyledHelpCircle
              size={25}
              onClick={() => setUpVolatilityText(!upVolatilityText)}
              style={{
                cursor: 'pointer',
              }}
            />
          </Text>
        </Flex>
        <Accordion isOpen={upVolatilityText} p={upVolatilityText ? 5 : 0} noScroll>
          <Flex p={8}>
            <Text>
              Data from the last {fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.
            </Text>
          </Flex>
        </Accordion>
        <TokenPortfolioHistogram />
      </Flex>
      <Flex col gap={10}>
        <Flex gap={10}>
          <Text t2 semibold>
            Token Price Volatility
          </Text>
          <Text autoAlignVertical>
            <StyledHelpCircle
              size={25}
              onClick={() => setTpvText(!tpvText)}
              style={{
                cursor: 'pointer',
              }}
            />
          </Text>
        </Flex>
        <Accordion isOpen={tpvText} p={tpvText ? 5 : 0} noScroll>
          <Flex p={8}>
            <Text>
              Data from the last {fetchedSipMathLib?.sips?.[0]?.metadata?.count} days was analyzed to build this chart.
            </Text>
          </Flex>
        </Accordion>
        <TokenPriceVolatilityHistogram />
      </Flex> */}
      <Flex col gap={10}>
        <Text t2 semibold>
          Premiums Paid By Period
        </Text>
        <PremiumsPaidByPeriodChart />
      </Flex>
      {/* <Flex col gap={10}>
          <Text t2 semibold>
            Token Price Volatility Cummulative
          </Text>
          <TokenPriceVolatilityCumm />
        </Flex> */}
    </Flex>
  )
}
