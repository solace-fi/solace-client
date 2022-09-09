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
  const [upVolatilityText, setUpVolatilityText] = useState<boolean>(false)
  const [tpvText, setTpvText] = useState<boolean>(false)
  const [upcText, setUpcText] = useState<boolean>(false)
  const [upValueText, setUpValueText] = useState<boolean>(false)

  const { data } = useAnalyticsContext()
  const { fetchedSipMathLib } = data

  setTimeout(() => console.log(fetchedSipMathLib), 3000)

  return (
    <Flex col gap={20} py={20} px={10}>
      <Flex col gap={10}>
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
      </Flex>
      <Flex col gap={10}>
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
      </Flex>
      <Flex col gap={10}>
        <Flex gap={10}>
          <Text t2 semibold>
            Underwriting Pool Volatility {/* (Daily % change) */}
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
              Data from the last {fetchedSipMathLib?.data?.sips?.[0]?.metadata?.count} days was analyzed to build this
              chart.
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
              Data from the last {fetchedSipMathLib?.data?.sips?.[0]?.metadata?.count} days was analyzed to build this
              chart.
            </Text>
          </Flex>
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
