import { FunctionName, PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const CurveProduct: SupportedProduct = {
  name: ProductName.CURVE,
  positionsType: PositionType.TOKEN,
  productLink: 'https://curve.fi/',
  gasLimits: {
    [1]: {
      [FunctionName.BUY_POLICY]: 566239,
      [FunctionName.SUBMIT_CLAIM]: 437020,
    },
  },
  supportedSubProducts: {
    [1]: ['Factory Pools', 'Gauge Deposits'],
  },
  getTokens: {
    [1]: getTokens,
  },
  getBalances: {
    [1]: getBalances,
  },
}
