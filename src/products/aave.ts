import { ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/aave/getBalances'
import { getTokens } from './positionGetters/aave/getTokens'

export const AaveProduct: SupportedProduct = {
  name: ProductName.AAVE,
  positionsType: 'erc20',
  productLink: 'https://app.aave.com/markets',
  getTokens,
  getBalances,
}
