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
  goodFetch: boolean
}

export type GlobalLockInfo = {
  solaceStaked: BigNumber
  valueStaked: BigNumber
  numLocks: BigNumber
  rewardPerSecond: BigNumber
  apr: BigNumber
}
