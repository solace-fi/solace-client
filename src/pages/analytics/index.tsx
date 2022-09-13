import React, { useMemo, useState } from 'react'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { useAnalyticsContext } from './AnalyticsContext'
import { TokenPortfolioAreaChart } from './TokenPortfolioAreaChart'
import { TokenPortfolioHistogram } from './TokenPortfolioHistogram'
import { TokenPriceVolatilityHistogram } from './TokenPriceVolatilityHistogram'
import { TokenPriceVolatilityCumm } from './TokenPriceVolatilityCumm'
import { Accordion } from '../../components/atoms/Accordion'
import { StyledHelpCircle } from '../../components/atoms/Icon'
import { TokenTable } from './TokenTable'
import { Card } from '../../components/atoms/Card'
import { useNetwork } from '../../context/NetworkManager'
import { truncateValue } from '../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { useVoteContext } from '../vote/VoteContext'
import CardSectionValue from '../lock/components/CardSectionValue'
import { PremiumsPaidByPeriodChart } from './PremiumsPaidByPeriodChart'

export default function Analytics(): JSX.Element {
  return <AnalyticsContent />
}

export function AnalyticsContent(): JSX.Element {
  const { activeNetwork } = useNetwork()
  const { data } = useAnalyticsContext()
  const { gauges } = useVoteContext()
  const { leverageFactor } = gauges
  const { fetchedPremiums, uwpValueUSD } = data

  const premiumsUSD = useMemo(() => {
    if (!fetchedPremiums || !fetchedPremiums?.data[activeNetwork.chainId]) return 0
    const premiumsByChainId = fetchedPremiums?.data[activeNetwork.chainId]
    const latestEpoch = premiumsByChainId.history[premiumsByChainId.history.length - 1]
    return latestEpoch.uweAmount * latestEpoch.uwpValuePerShare * latestEpoch.uwpPerUwe
  }, [activeNetwork, fetchedPremiums])

  const [upvText, setUpvText] = useState<boolean>(false)
  const [tpvText, setTpvText] = useState<boolean>(false)

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
