import { BigNumber } from 'ethers'
import { PolicyState } from '../enums'

export type ClaimDetails = { id: string; cooldown: string; canWithdraw: boolean; amount: BigNumber }

export type ClaimAssessment = {
  lossEventDetected: boolean
  amountOut: string
  deadline: string
  msgHash: string
  signature: string
}

export type Policy = {
  policyId: number
  policyHolder: string
  productAddress: string
  productName: string
  positionDescription: string
  positionAddrs: string[]
  positionNames: string[]
  underlyingPositionNames: string[]
  expirationBlock: number
  coverAmount: string
  price: string
  status: PolicyState
  claimAssessment?: ClaimAssessment
}
