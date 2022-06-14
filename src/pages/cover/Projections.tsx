import React, { useMemo } from 'react'
import { BigNumber, utils } from 'ethers'
import { Flex, Grid } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { floatUnits, truncateValue } from '../../utils/formatting'
import { StyledClose, StyledExport } from '../../components/atoms/Icon'
import { CardTemplate, SmallCardTemplate } from '../../components/atoms/Card/CardTemplate'

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
