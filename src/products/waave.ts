import { ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getBalances } from './positionGetters/waave/getBalances'
import { getTokens } from './positionGetters/waave/getTokens'
import { getAppraisals } from './positionGetters/waave/getAppraisals'

export const WaaveProduct: SupportedProduct = {
  name: ProductName.WAAVE,
  positionsType: 'erc20',
  getTokens,
  getBalances,
  getAppraisals,
}
