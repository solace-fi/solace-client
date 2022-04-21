import { SolaceRiskScore as SolaceRiskScoreType } from '@solace-fi/sdk-nightly'

export type SolaceRiskBalance = {
  network: string
  appId: string
  balanceUSD: number
}

export type SolaceRiskScore = SolaceRiskScoreType

export type SolaceRiskProtocol = {
  appId: string
  balanceUSD: number
  category: string
  network: string
  riskLoad: number
  rol: number
  rrol: number
  tier: number
  ['rp-usd']: number
  ['risk-adj']: number
}
