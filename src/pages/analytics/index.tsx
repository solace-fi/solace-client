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

export default function Analytics(): JSX.Element {
  return <AnalyticsContent />
}

export function AnalyticsContent(): JSX.Element {
  const [upVolatilityText, setUpVolatilityText] = useState<boolean>(false)
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

  // const [upvText, setUpvText] = useState<boolean>(false)
  const [tpvText, setTpvText] = useState<boolean>(false)
  const [upcText, setUpcText] = useState<boolean>(false)
  const [upValueText, setUpValueText] = useState<boolean>(false)

  return (
    <Flex col gap={20} py={20} px={10}>
      <Flex evenly gap={10}>
        <Card widthP={100}>
          <Text t4>Premiums</Text>
          <CardSectionValue info>${truncateValue(premiumsUSD, 2)}</CardSectionValue>
        </Card>
        <Card widthP={100}>
          <Text t4>Underwriting Pool Size</Text>
          <CardSectionValue info>${truncateValue(formatUnits(uwpValueUSD, 18), 2)} </CardSectionValue>
        </Card>
        <Card widthP={100}>
          <Text t4>Leverage Factor</Text>
          <CardSectionValue info>{leverageFactor}</CardSectionValue>
        </Card>
      </Flex>
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
        <PortfolioAreaChart2 />
        <TokenWeights1 />
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
      </Flex>
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
