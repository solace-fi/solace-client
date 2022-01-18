import { BigNumber } from 'ethers'

export type LockData = {
  xsLockID: BigNumber
  unboostedAmount: string
  end: BigNumber
  timeLeft: BigNumber
  boostedValue: string
  pendingRewards: string
  apy: BigNumber
}

export type UserLocksInfo = {
  pendingRewards: string
  stakedBalance: string
  lockedBalance: string
  unlockedBalance: string
  yearlyReturns: string
  apy: BigNumber
}

export type UserLocksData = {
  user: UserLocksInfo
  locks: LockData[]
}
