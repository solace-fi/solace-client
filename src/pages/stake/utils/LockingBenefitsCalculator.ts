const lockingBenefitsCalculator = (days: number): { apy: number; multiplier: number } => {
  const multiplier = 1 + (days / 365) * 0.2
  const apy = multiplier * 2000
  return { apy, multiplier }
}
export default lockingBenefitsCalculator
