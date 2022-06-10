import React, { ReactNode, useMemo } from 'react'
import { BigNumber, utils } from 'ethers'
import { Flex, Grid, VerticalSeparator } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { floatUnits, truncateValue } from '../../utils/formatting'
import { StyledTooltip } from '../../components/molecules/Tooltip'
import { StyledClock, StyledClose, StyledExport, StyledOptions } from '../../components/atoms/Icon'

function CardTemplate({
  hasIcon,
  title,
  children,
  techy,
  unit,
}: {
  title: string
  children: string | React.ReactNode
  hasIcon?: true
  techy?: true
  unit?: string
}) {
  return (
    <Flex col bgRaised p={16} gap={4} rounded>
      <Text
        t6s
        techygradient={techy}
        bold
        style={{
          lineHeight: '13.62px',
          maxWidth: '75px',
        }}
      >
        {title}
      </Text>
      <Text
        t4s
        techygradient={techy}
        bold
        style={{
          lineHeight: '19.07px',
        }}
      >
        {children}
        <Text inline t6s style={{ fontWeight: '400' }} dark>
          {unit}
        </Text>
      </Text>
    </Flex>
  )
}

function SmallCardTemplate({
  icon,
  value,
  techy,
  error,
  onClick,
}: {
  icon: ReactNode
  value: string
  techy?: true
  error?: true
  onClick?: () => void
}) {
  return (
    <Flex
      itemsCenter
      bgRaised
      // py={9.75}
      px={12}
      // p={16}
      gap={12}
      rounded
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      flex1
    >
      {icon}
      <Text t5s techygradient={techy} error={error} bold>
        {value}
      </Text>
    </Flex>
  )
}

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
    <Grid columns={2} gap={12}>
      <CardTemplate title="Simulated Portfolio Total">{`$${truncateValue(usdBalanceSum, 2)}`}</CardTemplate>
      <CardTemplate title="Simulated Cover Limit">{`$${truncateValue(
        utils.formatEther(coverageLimit),
        2
      )}`}</CardTemplate>
      <CardTemplate techy hasIcon title="Simulated Policy Price" unit="/ Day">{`$${truncateValue(
        dailyCost,
        2
      )}`}</CardTemplate>
      <Flex col gap={12}>
        <SmallCardTemplate
          icon={<StyledExport height={12} width={12} />}
          value={`Import Limit`}
          techy
          onClick={() => {
            alert('Import Limit')
          }}
        />
        <SmallCardTemplate
          icon={<StyledClose height={12} width={12} />}
          value={`Clear Changes`}
          error
          onClick={() => {
            alert('Clear Changes')
          }}
        />
      </Flex>
    </Grid>
    /* <Flex col>
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
    </Flex> */
  )
}
