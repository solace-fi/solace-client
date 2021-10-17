import { PositionType, ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/yearn/getBalances'
import { getTokens } from './positionGetters/yearn/getTokens'

export const YearnProduct: SupportedProduct = {
  name: ProductName.YEARN,
  positionsType: PositionType.TOKEN,
  productLink: 'https://yearn.finance/vaults',
  getTokens,
  getBalances,
}
