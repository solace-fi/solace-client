import { ClaimAssessment } from '../constants/types'

export async function getClaimAssessment(policyId: string): Promise<ClaimAssessment> {
  return fetch(`https://paclas.solace.fi/claims/assess?policyid=${policyId}`)
    .then((result) => result.json())
    .then((result) => {
      return result
    })
}
