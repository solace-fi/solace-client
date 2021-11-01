import { FunctionName, PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const AaveProduct: SupportedProduct = {
  name: ProductName.AAVE,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.aave.com/markets',
  gasLimits: {
    [1]: {
      [FunctionName.BUY_POLICY]: 663069,
      [FunctionName.SUBMIT_CLAIM]: 437085,
    },
  },
  getTokens: {
    [1]: getTokens,
    [42]: getTokens,
  },
  getBalances: {
    [1]: getBalances,
    [42]: getBalances,
  },
}
