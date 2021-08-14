import { ClaimAssessment } from '../constants/types'
import axios from 'axios'

export async function getClaimAssessment(policyId: string, chainId: number): Promise<ClaimAssessment> {
  const { data } = await axios.get(`https://paclas.solace.fi/claims/assess2`, {
    params: { chainid: chainId, policyid: policyId },
  })
  return data
}
