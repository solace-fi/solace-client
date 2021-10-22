import { ClaimAssessment } from '../constants/types'
import axios from 'axios'
import { withBackoffRetries } from './time'

export async function getClaimAssessment(policyId: string, chainId: number): Promise<ClaimAssessment> {
  const { data } = await axios.get(`https://paclas.solace.fi/claims/assess`, {
    params: { chainid: chainId, policyid: policyId },
  })
  return data
}

export const get1InchPrice = async (fromAddress: string, toAddress: string, amount: string): Promise<any> => {
  return await withBackoffRetries(async () =>
    axios.get(
      `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${fromAddress}&toTokenAddress=${toAddress}&amount=${amount}`
    )
  )
}
