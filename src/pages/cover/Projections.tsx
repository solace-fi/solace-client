import React, { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { Flex, VerticalSeparator } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { SolaceRiskScore } from '../../constants/types'
import { floatUnits, truncateValue } from '../../utils/formatting'
import { StyledTooltip } from '../../components/molecules/Tooltip'

export const Projections = ({
  portfolioScore,
  coverageLimit,
}: {
  portfolioScore?: SolaceRiskScore
  coverageLimit: BigNumber
}): JSX.Element => {
  const { styles } = useCoverageContext()
  const { gradientStyle } = styles

  const usdBalanceSum = useMemo(
    () =>
      portfolioScore && portfolioScore.protocols && portfolioScore.protocols.length > 0
        ? portfolioScore.protocols.reduce((total, protocol) => (total += protocol.balanceUSD), 0)
        : 0,
    [portfolioScore]
  )

  const annualRate = useMemo(() => (portfolioScore && portfolioScore.current_rate ? portfolioScore.current_rate : 0), [
    portfolioScore,
  ])

  const dailyRate = useMemo(() => annualRate / 365.25, [annualRate])

  const dailyCost = useMemo(() => {
    const numberifiedSimCoverageLimit = floatUnits(coverageLimit, 18)
    if (usdBalanceSum < numberifiedSimCoverageLimit) return usdBalanceSum * dailyRate
    return numberifiedSimCoverageLimit * dailyRate
  }, [coverageLimit, dailyRate, usdBalanceSum])

  return (
    <Flex stretch evenly center pb={24}>
      <Flex col>
        <Text bold t2 textAlignCenter>
          Total
        </Text>
        <Text textAlignCenter bold t1 {...gradientStyle}>
          ${truncateValue(usdBalanceSum, 2)}
        </Text>
      </Flex>
      <VerticalSeparator />
      <StyledTooltip
        id={`projected-premium`}
        tip={`$${dailyCost * 365.25} / Year`}
        alwaysShowChildren
        disabled={dailyCost >= 0.01 || dailyCost == 0}
      >
        <Flex col>
          <Text bold t2 textAlignCenter>
            Daily Premium
          </Text>
          <Text textAlignCenter>
            <TextSpan t1 bold {...gradientStyle}>
              ${truncateValue(dailyCost, 2)}
            </TextSpan>
            <TextSpan t5s bold pl={5}>
              / Day
            </TextSpan>
          </Text>
        </Flex>
      </StyledTooltip>
    </Flex>
  )
}
