import { PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const UniswapV3Product: SupportedProduct = {
  name: ProductName.UNISWAP_V3,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.uniswap.org/#/pool',
  getTokens,
  getBalances,
}
