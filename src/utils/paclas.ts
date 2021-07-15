export type ClaimAssessment = {
  lossEventDetected: boolean
  tokenIn: string
  amountIn: string
  tokenOut: string
  amountOut: string
  deadline: string
  msgHash: string
  signature: string
}

export async function getClaimAssessment(policyId: string): Promise<ClaimAssessment> {
  return fetch(`https://paclas.solace.fi/claims/assess?policyid=${policyId}`)
    .then((result) => result.json())
    .then((result) => {
      return result
    })
}
