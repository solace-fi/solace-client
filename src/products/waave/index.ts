import { PositionType, ProductName } from '../../constants/enums'
import { SupportedProduct } from '../../constants/types'
import { getBalances } from './positionGetter/getBalances'
import { getTokens } from './positionGetter/getTokens'

export const WaaveProduct: SupportedProduct = {
  name: ProductName.WAAVE,
  positionsType: PositionType.TOKEN,
  getTokens: {
    [4]: getTokens,
    [42]: getTokens,
  },
  getBalances: {
    [4]: getBalances,
    [42]: getBalances,
  },
}
