import { PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const SushiswapProduct: SupportedProduct = {
  name: ProductName.SUSHISWAP,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.sushi.com/pool',
  getTokens,
  getBalances,
}
