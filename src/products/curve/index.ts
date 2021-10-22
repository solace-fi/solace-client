import { PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const CurveProduct: SupportedProduct = {
  name: ProductName.CURVE,
  positionsType: PositionType.TOKEN,
  productLink: 'https://curve.fi/',
  supportedSubProducts: {
    [1]: ['Gauge Deposits', 'Factory Pools'],
  },
  getTokens: {
    [1]: getTokens,
  },
  getBalances: {
    [1]: getBalances,
  },
}
