import { FunctionName, PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const SushiswapProduct: SupportedProduct = {
  name: ProductName.SUSHISWAP,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.sushi.com/pool',
  gasLimits: {
    [1]: {
      [FunctionName.BUY_POLICY]: 581811,
      [FunctionName.SUBMIT_CLAIM]: 437146,
    },
  },
  supportedSubProducts: {
    [1]: ['MasterChefV2 Staking Pool'],
  },
  getTokens: {
    [1]: getTokens,
  },
  getBalances: {
    [1]: getBalances,
  },
}
