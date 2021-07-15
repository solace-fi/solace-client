import { BigNumber } from 'ethers'
import { PolicyState } from '../constants/enums'
import { Contract } from '@ethersproject/contracts'

export type ClaimDetails = { id: string; cooldown: string; canWithdraw: boolean; amount: BigNumber }

export type Policy = {
  policyId: number
  policyHolder: string
  productAddress: string
  productName: string
  positionContract: string
  expirationBlock: string
  coverAmount: string
  price: string
  status: PolicyState
  positionName: string
}

export type TokenInfo = {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: BigNumber
}

export type Token = {
  token: {
    address: string
    name: string
    symbol: string
    decimals: number
    balance: BigNumber
  }
  underlying: {
    address: string
    name: string
    symbol: string
    decimals: number
    balance: BigNumber
  }
  eth: {
    balance: BigNumber
  }
}

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

export type GasFeeOption = {
  key: string
  name: string
  value: number
}

export type StringToStringMapping = { [key: string]: string }

export type SupportedProduct = { name: string; contract: Contract; signer: boolean }

export type ContractSources = { addr: string; abi: any }
