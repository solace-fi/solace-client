import React from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { TokenPortfolioAreaChart } from './TokenPortfolioAreaChart'
import { TokenPriceVolatilityHistogram } from './TokenPriceVolatilityHistogram'

export default function Analytics(): JSX.Element {
  return (
    <Flex col gap={20}>
      <Flex col gap={10}>
        <Text t2 semibold>
          Historical Token Portfolio in Native UWP
        </Text>
        <TokenPortfolioAreaChart />
      </Flex>
      <Flex col gap={10}>
        <Text t2 semibold>
          Token Price Volatility
        </Text>
        <TokenPriceVolatilityHistogram />
      </Flex>
    </Flex>
  )
}
