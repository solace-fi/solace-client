import { ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/compound/getBalances'
import { getTokens } from './positionGetters/compound/getTokens'
import { getAppraisals } from './positionGetters/compound/getAppraisals'

export const CompoundProduct: SupportedProduct = {
  name: ProductName.COMPOUND,
  positionsType: 'erc20',
  productLink: 'https://app.compound.finance',
  getTokens,
  getBalances,
  getAppraisals,
}
