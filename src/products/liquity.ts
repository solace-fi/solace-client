import { ProductName, PositionType } from '../constants/enums'
import { SupportedProduct } from '../constants/types'
import { getPositions } from './positionGetters/liquity/getPositions'

export const LiquityProduct: SupportedProduct = {
  name: ProductName.LIQUITY,
  positionsType: PositionType.LQTY,
  getPositions,
}
