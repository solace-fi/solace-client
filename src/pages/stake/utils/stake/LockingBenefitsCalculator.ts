const lockingBenefitsCalculator = (days: number): { apr: number; multiplier: number } => {
  const multiplier = 1 + (days / 365) * 0.2
  const apr = multiplier * 2000
  return { apr, multiplier }
}

export default lockingBenefitsCalculator
