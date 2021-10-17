import { PositionType, ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/curve/getBalances'
import { getTokens } from './positionGetters/curve/getTokens'

export const CurveProduct: SupportedProduct = {
  name: ProductName.CURVE,
  positionsType: PositionType.TOKEN,
  productLink: 'https://curve.fi/',
  getTokens,
  getBalances,
}
