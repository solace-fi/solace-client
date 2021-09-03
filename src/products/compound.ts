import { ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/compound/getBalances'
import { getTokens } from './positionGetters/compound/getTokens'

export const CompoundProduct: SupportedProduct = {
  name: ProductName.COMPOUND,
  getTokens,
  getBalances,
}
