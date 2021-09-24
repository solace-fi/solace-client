import { ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getAppraisals } from './positionGetters/liquity/getAppraisals'
import { getPositions } from './positionGetters/liquity/getPositions'

export const LiquityProduct: SupportedProduct = {
  name: ProductName.LIQUITY,
  positionsType: 'liquity',
  getAppraisals,
  getPositions,
}
