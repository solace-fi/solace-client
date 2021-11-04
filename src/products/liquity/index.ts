import { ProductName, PositionType, FunctionName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getPositions } from './positionGetter/getPositions'

export const LiquityProduct: SupportedProduct = {
  name: ProductName.LIQUITY,
  positionsType: PositionType.LQTY,
  gasLimits: {
    [1]: {
      [FunctionName.BUY_POLICY]: 556900,
      [FunctionName.SUBMIT_CLAIM]: 437020,
    },
  },
  getPositions: {
    [1]: getPositions,
    [4]: getPositions,
  },
}
