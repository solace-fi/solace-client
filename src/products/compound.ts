import { ProductName, PositionType } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/compound/getBalances'
import { getTokens } from './positionGetters/compound/getTokens'

export const CompoundProduct: SupportedProduct = {
  name: ProductName.COMPOUND,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.compound.finance',
  getTokens,
  getBalances,
}
