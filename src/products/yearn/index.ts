import { PositionType, ProductName, FunctionName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const YearnProduct: SupportedProduct = {
  name: ProductName.YEARN,
  positionsType: PositionType.TOKEN,
  productLink: 'https://yearn.finance/vaults',
  gasLimits: {
    [1]: {
      [FunctionName.BUY_POLICY]: 589620,
      [FunctionName.SUBMIT_CLAIM]: 437121,
    },
  },
  getTokens: {
    [1]: getTokens,
  },
  getBalances: {
    [1]: getBalances,
  },
}
