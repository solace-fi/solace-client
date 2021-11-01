import { FunctionName, PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const UniswapV3Product: SupportedProduct = {
  name: ProductName.UNISWAP_V3,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.uniswap.org/#/pool',
  gasLimits: {
    [1]: {
      [FunctionName.BUY_POLICY]: 571614,
      [FunctionName.SUBMIT_CLAIM]: 437046,
    },
  },
  getTokens: {
    [1]: getTokens,
  },
  getBalances: {
    [1]: getBalances,
  },
}
