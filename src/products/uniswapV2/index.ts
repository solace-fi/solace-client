import { FunctionName, PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const UniswapV2Product: SupportedProduct = {
  name: ProductName.UNISWAP_V2,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.uniswap.org/#/pool/v2',
  gasLimits: {
    [1]: {
      [FunctionName.BUY_POLICY]: 581361,
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
