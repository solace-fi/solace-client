export type SolaceRiskBalance = {
  network: string
  appId: string
  balanceUSD: number
  balanceETH: number
}

export type SolaceRiskScore = {
  address: string
  address_rp: number
  current_rate: number
  timestamp: string
  metadata: {
    seriesName: string
    version: string
    dateCreated: string
    provenance: string
    generatedBy: string
    sourceDataType: string
    sourceDataVersion: string
  }
  protocols: SolaceRiskProtocol[]
}

export type SolaceRiskProtocol = {
  appId: string
  balanceETH: number
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
