import { SolaceRiskScore, SolaceRiskProtocol } from '@solace-fi/sdk-nightly'
import { useMemo } from 'react'
import { floatUnits } from '../../utils/formatting'
import { BigNumber } from 'ethers'

export const usePortfolioAnalysis = (
  portfolio: SolaceRiskScore | undefined,
  appliedCoverLimit: BigNumber
): {
  highestPosition: SolaceRiskProtocol | undefined
  usdBalanceSum: number
  annualRate: number
  dailyRate: number
  dailyCost: number
} => {
  const highestPosition = useMemo(
    () =>
      portfolio && portfolio.protocols && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((pn, cn) => (cn.balanceUSD > pn.balanceUSD ? cn : pn))
        : undefined,
    [portfolio]
  )

  const usdBalanceSum = useMemo(
    () =>
      portfolio && portfolio.protocols && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((total, protocol) => (total += protocol.balanceUSD), 0)
        : 0,
    [portfolio]
  )

  const annualRate = useMemo(() => (portfolio && portfolio.current_rate ? portfolio.current_rate : 0), [portfolio])

  const dailyRate = useMemo(() => annualRate / 365.25, [annualRate])

  const dailyCost = useMemo(() => {
    const numberifiedSimCoverageLimit = floatUnits(appliedCoverLimit, 18)
    if (usdBalanceSum < numberifiedSimCoverageLimit) return usdBalanceSum * dailyRate
    return numberifiedSimCoverageLimit * dailyRate
  }, [appliedCoverLimit, dailyRate, usdBalanceSum])

  return {
    highestPosition,
    usdBalanceSum,
    annualRate,
    dailyRate,
    dailyCost,
  }
}
