export type GasFeeListState = {
  options: GasFeeOption[]
  loading: boolean
  selected?: GasFeeOption
  suggestedBaseFee?: number
}

export type GasFeeOption = {
  key: string
  name: string
  value: number
}

export type GasPriceResult = {
  fast: number
  proposed: number
  safe: number
  suggestBaseFee?: number
}

export type GasData = {
  gasPrice: number
  maxFeePerGas: number
  maxPriorityFeePerGas: number
}
