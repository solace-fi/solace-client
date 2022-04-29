import { BigNumber } from 'ethers'

export type LockData = {
  xsLockID: BigNumber
  unboostedAmount: BigNumber
  end: BigNumber
  timeLeft: BigNumber
  boostedValue: BigNumber
  pendingRewards: BigNumber
  apr: BigNumber
}

export type UserLocksInfo = {
  pendingRewards: BigNumber
  stakedBalance: BigNumber
  lockedBalance: BigNumber
  unlockedBalance: BigNumber
  yearlyReturns: BigNumber
  apr: BigNumber
}

export type UserLocksData = {
  user: UserLocksInfo
  locks: LockData[]
  successfulFetch: boolean
}

export type GlobalLockInfo = {
  solaceStaked: string
  valueStaked: string
  numLocks: string
  rewardPerSecond: string
  apr: string
  successfulFetch: boolean
}
