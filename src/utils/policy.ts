import { PolicyState } from '../constants/enums'
import { Policy } from '../constants/types'
import { trim0x } from './formatting'

export const userHasActiveProductPosition = (userPolicies: Policy[], product: string, address: string): boolean => {
  for (const policy of userPolicies) {
    if (
      product === policy.productName &&
      policy.positionDescription.includes(trim0x(address)) &&
      policy.status === PolicyState.ACTIVE
    )
      return true
  }
  return false
}
