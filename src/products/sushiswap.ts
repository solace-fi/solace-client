import { PositionType, ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/sushiswap/getBalances'
import { getTokens } from './positionGetters/sushiswap/getTokens'

export const SushiswapProduct: SupportedProduct = {
  name: ProductName.SUSHISWAP,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.sushi.com/pool',
  getTokens,
  getBalances,
}
