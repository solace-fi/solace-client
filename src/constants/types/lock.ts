import { BigNumber } from 'ethers'

export type LockData = {
  xsLockID: BigNumber
  unboostedAmount: BigNumber
  end: BigNumber
  timeLeft: BigNumber
  boostedValue: BigNumber
  pendingRewards: BigNumber
  apy: BigNumber
}

export type UserLocksInfo = {
  pendingRewards: BigNumber
  stakedBalance: BigNumber
  lockedBalance: BigNumber
  unlockedBalance: BigNumber
  yearlyReturns: BigNumber
  apy: BigNumber
}

export type UserLocksData = {
  user: UserLocksInfo
  locks: LockData[]
}

export type GlobalLockInfo = {
  solaceStaked: BigNumber
  valueStaked: BigNumber
  numLocks: BigNumber
  rewardPerSecond: BigNumber
  apy: BigNumber
}
