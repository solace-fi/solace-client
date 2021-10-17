import { PositionType, ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/uniswapV2/getBalances'
import { getTokens } from './positionGetters/uniswapV2/getTokens'

export const UniswapV2Product: SupportedProduct = {
  name: ProductName.UNISWAP_V2,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.uniswap.org/#/pool/v2',
  getTokens,
  getBalances,
}
