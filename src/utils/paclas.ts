import axios from 'axios'
import { PACLAS_POLICY_ENDPOINT } from '../constants/apiURL'
import { getNetworkName } from '../utils'
import { Policy } from '../hooks/useGetter'

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

export async function getPoliciesOfUser(user: string, product: string, chainId: number): Promise<Policy[]> {
  const { data } = await axios.get(PACLAS_POLICY_ENDPOINT, {
    params: { user: user, product: product, chainId: chainId },
  })
  return handleResponse(data)
}

export async function getAllPolicies(chainId: number): Promise<Policy[]> {
  const { data } = await axios.get(PACLAS_POLICY_ENDPOINT, {
    params: { chainId: chainId },
  })
  return handleResponse(data)
}

export async function getUserPolicies(user: string, chainId: number): Promise<Policy[]> {
  const { data } = await axios.get(PACLAS_POLICY_ENDPOINT, { params: { user: user, chainId: chainId } })
  return handleResponse(data)
}

const handleResponse = (response: any): Policy[] => {
  let policies: Policy[] = []
  if (response) {
    policies = response as Policy[]
  }
  return policies
}

export async function getPolicyPrice(policyId: number): Promise<string> {
  const { data } = await axios.get(PACLAS_POLICY_ENDPOINT)
  const policy = data.filter((policy: any) => policy.policyId == policyId)[0]
  return policy.price
}

export async function getPositions(protocol: string, chainId: number, user: string): Promise<any> {
  return fetch(`https://paclas.solace.fi/positions/appraise/${protocol}/${getNetworkName(chainId)}/${user}`)
    .then((result) => result.json())
    .then((result) => {
      return result
    })
}
