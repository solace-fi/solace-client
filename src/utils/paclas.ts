import { getNetworkName } from '../utils'

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

export async function getPositions(protocol: string, chainId: number, user: string): Promise<any> {
  return fetch(`https://paclas.solace.fi/positions/appraise/${protocol}/${getNetworkName(chainId)}/${user}`)
    .then((result) => result.json())
    .then((result) => {
      return result
    })
}
