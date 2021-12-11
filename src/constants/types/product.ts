import { ProductName, PositionType } from '../enums'
import { NetworkConfig } from './network'
import { Token } from './position'

export type SupportedProduct = {
  name: ProductName
  positionsType: PositionType
  productLink?: string
  gasLimits?: {
    // network chain Id
    [key: number]: {
      // mapping of FunctionName to gas limit number
      [key: string]: number
    }
  }
  supportedSubProducts?: {
    [key: number]: string[] // array of farm or other pool positions for a product supported on different chains
  }

  getTokens?: {
    [key: number]: (provider: any, activeNetwork: NetworkConfig, metadata?: any) => Promise<Token[]>
  }
  getBalances?: {
    [key: number]: (user: string, provider: any, activeNetwork: NetworkConfig, tokens: Token[]) => Promise<Token[]>
  }
  getPositions?: {
    [key: number]: any
  }
}
