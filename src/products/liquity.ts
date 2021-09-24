import { ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getAppraisals } from './positionGetters/liquity/getAppraisals'
import { getPositions } from './positionGetters/liquity/getPositions'
import { getTokens } from './positionGetters/liquity/getTokens'

export const LiquityProduct: SupportedProduct = {
  name: ProductName.LIQUITY,
  positionsType: 'liquity',
  getAppraisals,
  getPositions,
  getTokens,
}
