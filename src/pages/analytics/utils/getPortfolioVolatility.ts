export const getPortfolioVolatility = (
  weights: number[],
  simulatedVolatility: number[][],
  trials: number
): number[] => {
  const result: number[] = Array(trials).fill(0) // fixed array of length 1000 and initialized with zeroes
  for (let i = 0; i < trials; i++) {
    let trialSum = 0
    for (let j = 0; j < simulatedVolatility.length; j++) {
      const ticker = simulatedVolatility[j]
      const volatilityTrials = ticker // array of 1000 trials based on token ticker
      const weight = weights[j] // number less than 1
      const adjustedVolatility = volatilityTrials[i] * weight
      trialSum += adjustedVolatility
    }
    result[i] = trialSum // add to the result array
  }
  return result
}
