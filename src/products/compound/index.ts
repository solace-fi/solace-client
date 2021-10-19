import { ProductName, PositionType } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const CompoundProduct: SupportedProduct = {
  name: ProductName.COMPOUND,
  positionsType: PositionType.TOKEN,
  productLink: 'https://app.compound.finance',
  getTokens,
  getBalances,
}
