import axios from 'axios'
import { PACLAS_POLICY_ENDPOINT } from '../constants/apiURL'
import { PolicyStatus } from '../constants/enums'

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
  positionName: string
}

export async function getPoliciesOfUser(user: string, product: string, chainId: number): Promise<Policy[]> {
  const { data } = await axios.get(PACLAS_POLICY_ENDPOINT, {
    params: { user: user, product: product, chainId: chainId },
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

export async function getPolicyPrice(policyId: number): Promise<string> {
  const { data } = await axios.get(PACLAS_POLICY_ENDPOINT)
  const policy = data.filter((policy: any) => policy.policyId == policyId)[0]
  return policy.price
}
