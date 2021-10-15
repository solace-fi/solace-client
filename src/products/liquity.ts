import { ProductName } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getPositions } from './positionGetters/liquity/getPositions'

export const LiquityProduct: SupportedProduct = {
  name: ProductName.LIQUITY,
  positionsType: 'liquity',
  getPositions,
}
