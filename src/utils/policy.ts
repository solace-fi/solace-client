import { Block } from '@ethersproject/abstract-provider'
import { PolicyState } from '../constants/enums'
import { Policy } from '../constants/types'
import { trim0x } from './formatting'
import { getDaysLeftByBlockNum, getExpiration } from './time'

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

export const calculatePolicyExpirationDate = (latestBlock: Block | undefined, expirationBlock: number): string => {
  if (!latestBlock) return 'Fetching...'
  const daysLeft = getDaysLeftByBlockNum(expirationBlock, latestBlock.number)
  return getExpiration(daysLeft)
}

export const shouldWarnUser = (latestBlock: Block | undefined, policy: Policy): boolean => {
  return (
    policy.status === PolicyState.ACTIVE &&
    getDaysLeftByBlockNum(policy.expirationBlock, latestBlock ? latestBlock.number : 0) <= 1
  )
}
