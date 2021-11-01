import { ProductName, PositionType, FunctionName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const CompoundProduct: SupportedProduct = {
  name: ProductName.COMPOUND,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.compound.finance',
  gasLimits: {
    [1]: {
      [FunctionName.BUY_POLICY]: 577830,
      [FunctionName.SUBMIT_CLAIM]: 441321,
    },
  },
  getTokens: {
    [1]: getTokens,
    [4]: getTokens,
  },
  getBalances: {
    [1]: getBalances,
    [4]: getBalances,
  },
}
