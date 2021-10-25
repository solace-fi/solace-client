import { PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const YearnProduct: SupportedProduct = {
  name: ProductName.YEARN,
  positionsType: PositionType.TOKEN,
  productLink: 'https://yearn.finance/vaults',
  getTokens: {
    [1]: getTokens,
  },
  getBalances: {
    [1]: getBalances,
  },
}
