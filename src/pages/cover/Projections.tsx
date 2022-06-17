import React, { useMemo } from 'react'
import { BigNumber, utils } from 'ethers'
import { Flex, Grid } from '../../components/atoms/Layout'
import { useCoverageContext } from './CoverageContext'
import { SolaceRiskScore } from '@solace-fi/sdk-nightly'
import { accurateMultiply, floatUnits, truncateValue } from '../../utils/formatting'
import { StyledClose, StyledExport } from '../../components/atoms/Icon'
import { CardTemplate, SmallCardTemplate } from '../../components/atoms/Card/CardTemplate'
import { ZERO } from '../../constants'
import { ChosenLimit } from '../../constants/enums'

export const Projections = ({
  portfolioScore,
  coverageLimit,
}: {
  portfolioScore?: SolaceRiskScore
  coverageLimit: BigNumber
}): JSX.Element => {
  const { intrface, input, portfolioKit, policy } = useCoverageContext()
  const { handleShowSimCoverModal, handleShowCLDModal, handleShowSimulatorModal } = intrface
  const { handleImportedCoverLimit, handleSimCoverLimit } = input
  const {
    handleImportCounter,
    handleSimChosenLimit,
    handleClearCounter,
    curHighestPosition,
    simChosenLimit,
  } = portfolioKit
  const { status } = policy

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

  const chosenLimit = useMemo(() => {
    switch (simChosenLimit) {
      case ChosenLimit.Custom:
        return 'Custom'
      case ChosenLimit.MaxPosition:
        return 'Base'
      case ChosenLimit.Recommended:
      default:
        return 'Recommended'
    }
  }, [simChosenLimit])

  return (
    <Grid columns={2} gap={12}>
      <CardTemplate title="Simulated Portfolio Total">{`$${truncateValue(usdBalanceSum, 2)}`}</CardTemplate>
      <CardTemplate
        title={`${chosenLimit} Cover Limit`}
        hasIcon
        onClick={() => handleShowSimCoverModal(true)}
      >{`$${truncateValue(utils.formatUnits(coverageLimit), 2)}`}</CardTemplate>
      <CardTemplate techy title="Simulated Policy Price" unit="/ Day">{`$${truncateValue(dailyCost, 2)}`}</CardTemplate>
      <Flex col gap={12}>
        <SmallCardTemplate
          icon={<StyledExport height={12} width={12} />}
          value={status ? `Import Limit` : `Buy Now`}
          techy
          onClick={() => {
            handleImportedCoverLimit(coverageLimit)
            handleImportCounter()
            handleShowSimulatorModal(false)
            handleShowCLDModal(true)
          }}
        />
        <SmallCardTemplate
          icon={<StyledClose height={12} width={12} />}
          value={`Clear Changes`}
          error
          onClick={() => {
            handleClearCounter()
            handleSimChosenLimit(ChosenLimit.Recommended)
            if (curHighestPosition) {
              const bnBal = BigNumber.from(accurateMultiply(curHighestPosition.balanceUSD, 18))
              const bnHigherBal = bnBal.add(bnBal.div(BigNumber.from('5')))
              handleSimCoverLimit(bnHigherBal)
            } else {
              handleSimCoverLimit(ZERO)
            }
          }}
        />
      </Flex>
    </Grid>
  )
}
