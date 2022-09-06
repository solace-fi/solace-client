import React from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import AnalyticsManager from './AnalyticsContext'
import { TokenPortfolioAreaChart } from './TokenPortfolioAreaChart'
import { TokenPortfolioHistogram } from './TokenPortfolioHistogram'
import { TokenPriceVolatilityHistogram } from './TokenPriceVolatilityHistogram'
import { TokenPriceVolatilityCumm } from './TokenPriceVolatilityCumm'

export default function Analytics(): JSX.Element {
  return (
    <AnalyticsManager>
      <Flex col gap={20}>
        <Flex col gap={10}>
          <Text t2 semibold>
            Underwriting Pool Composition (USD)
          </Text>
          {/* <TokenPortfolioAreaChart /> */}
        </Flex>
        <Flex col gap={10}>
          <Text t2 semibold>
            Underwriting Pool Volatility (Daily % change)
          </Text>
          <TokenPortfolioHistogram />
        </Flex>
        <Flex col gap={10}>
          <Text t2 semibold>
            Token Price Volatility
          </Text>
          <TokenPriceVolatilityHistogram />
        </Flex>
        <Flex col gap={10}>
          <Text t2 semibold>
            Token Price Volatility Cummulative
          </Text>
          <TokenPriceVolatilityCumm />
        </Flex>
      </Flex>
    </AnalyticsManager>
  )
}
