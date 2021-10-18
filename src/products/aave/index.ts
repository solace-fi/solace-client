import { PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const AaveProduct: SupportedProduct = {
  name: ProductName.AAVE,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.aave.com/markets',
  getTokens,
  getBalances,
}
