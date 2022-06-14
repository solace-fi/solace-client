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
  onClick,
}: {
  title: string
  children: string | React.ReactNode
  hasIcon?: true
  techy?: true
  unit?: string
  onClick?: () => void
}) {
  return (
    <Flex
      col
      bgRaised
      p={16}
      gap={4}
      rounded
      style={{
        cursor: hasIcon ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Flex between>
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
        {hasIcon && <StyledOptions height={12} width={12} />}
      </Flex>
      <Text
        t4s
        techygradient={techy}
        bold
        style={{
          lineHeight: '19.07px',
        }}
      >
        {children}
        <Text ml={3} inline t6s style={{ fontWeight: '400' }} dark>
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
  const { intrface, input, portfolioKit } = useCoverageContext()
  const { handleShowSimCoverModal, handleShowCLDModal, handleShowSimulatorModal } = intrface
  const { handleEnteredCoverLimit } = input
  const { handleSimPortfolio, handleImportCounter } = portfolioKit

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
      <CardTemplate
        title="Simulated Cover Limit"
        hasIcon
        onClick={() => handleShowSimCoverModal(true)}
      >{`$${truncateValue(utils.formatUnits(coverageLimit), 2)}`}</CardTemplate>
      <CardTemplate techy title="Simulated Policy Price" unit="/ Day">{`$${truncateValue(dailyCost, 2)}`}</CardTemplate>
      <Flex col gap={12}>
        <SmallCardTemplate
          icon={<StyledExport height={12} width={12} />}
          value={`Import Limit`}
          techy
          onClick={() => {
            handleEnteredCoverLimit(coverageLimit)
            handleImportCounter()
            handleShowSimulatorModal(false)
            handleShowCLDModal(true)
          }}
        />
        <SmallCardTemplate
          icon={<StyledClose height={12} width={12} />}
          value={`Clear Changes`}
          error
          onClick={() => handleSimPortfolio(undefined)}
        />
      </Flex>
    </Grid>
  )
}
