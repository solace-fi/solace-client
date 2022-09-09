import React, { useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import AnalyticsManager, { useAnalyticsContext } from './AnalyticsContext'
import { TokenPortfolioAreaChart } from './TokenPortfolioAreaChart'
import { TokenPortfolioHistogram } from './TokenPortfolioHistogram'
import { TokenPriceVolatilityHistogram } from './TokenPriceVolatilityHistogram'
import { TokenPriceVolatilityCumm } from './TokenPriceVolatilityCumm'
import { Accordion } from '../../components/atoms/Accordion'
import { StyledHelpCircle } from '../../components/atoms/Icon'
import { TokenTable } from './TokenTable'

export default function Analytics(): JSX.Element {
  return (
    <AnalyticsManager>
      <AnalyticsContent />
    </AnalyticsManager>
  )
}

export function AnalyticsContent(): JSX.Element {
  const [upvText, setUpvText] = useState<boolean>(false)
  const [tpvText, setTpvText] = useState<boolean>(false)

  const { data } = useAnalyticsContext()
  const { fetchedSipMathLib } = data

  setTimeout(() => console.log(fetchedSipMathLib), 3000)

  return (
    <Flex col gap={20} py={20} px={10}>
      <Flex col gap={10}>
        <Text t2 semibold>
          Underwriting Pool Composition
        </Text>
        <TokenTable />
      </Flex>
      <Flex col gap={10}>
        <Text t2 semibold>
          Underwriting Pool Value (USD)
        </Text>
        <TokenPortfolioAreaChart />
      </Flex>
      <Flex col gap={10}>
        <Flex gap={10}>
          <Text t2 semibold>
            Underwriting Pool Volatility {/* (Daily % change) */}
          </Text>
          <Text autoAlignVertical>
            <StyledHelpCircle size={25} onClick={() => setUpvText(!upvText)} />
          </Text>
        </Flex>
        <Accordion isOpen={upvText} p={upvText ? 5 : 0} noScroll>
          <Text>
            Value at risk is a measure of the risk of loss for the portfolio of tokens in the underwriting pool. It
            estimates how much a might be lost, given normal market conditions, in a day. This is based on historical
            observations of token price changes.
          </Text>
        </Accordion>
        <TokenPortfolioHistogram />
      </Flex>
      <Flex col gap={10}>
        <Flex gap={10}>
          <Text t2 semibold>
            Token Price Volatility
          </Text>
          <Text autoAlignVertical>
            <StyledHelpCircle size={25} onClick={() => setTpvText(!tpvText)} />
          </Text>
        </Flex>
        <Accordion isOpen={tpvText} p={tpvText ? 5 : 0} noScroll>
          <Text>
            Value at risk is a measure of the risk of loss for a token in the underwriting pool. It estimates how much a
            might be lost, given normal market conditions, in a day. This is based on historical observations of token
            price changes.
          </Text>
        </Accordion>
        <TokenPriceVolatilityHistogram />
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
