import axios from 'axios'
import { PACLAS_POLICY_ENDPOINT } from '../constants/apiURL'
import { PolicyPosition, PolicyStatus } from '../constants/enums'

export interface Policy {
  policyId: number
  policyHolder: string
  productAddress: string
  productName: string
  positionContract: string
  expirationBlock: string
  coverAmount: string
  price: string
  status: PolicyStatus
  positionName: PolicyPosition
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

export async function getAllPoliciesOfUser(user: string, chainId: number): Promise<Policy[]> {
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
