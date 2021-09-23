import { ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/waave/getBalances'
import { getTokens } from './positionGetters/waave/getTokens'

export const LiquityProduct: SupportedProduct = {
  name: ProductName.LIQUITY,
  getTokens,
  getBalances,
}
