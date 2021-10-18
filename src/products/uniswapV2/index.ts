import { PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const UniswapV2Product: SupportedProduct = {
  name: ProductName.UNISWAP_V2,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.uniswap.org/#/pool/v2',
  getTokens,
  getBalances,
}
