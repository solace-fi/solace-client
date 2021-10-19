import { ProductName, PositionType } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getPositions } from './positionGetter/getPositions'

export const LiquityProduct: SupportedProduct = {
  name: ProductName.LIQUITY,
  positionsType: PositionType.LQTY,
  getPositions,
}
