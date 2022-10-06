import { BigNumber } from '@solace-fi/sdk-nightly'

export type VoteLockData = {
  lockID: BigNumber
} & VoteLock

export type UserVoteLocksInfo = {
  stakedBalance: BigNumber
}

export type UserVoteLocksData = {
  user: UserVoteLocksInfo
  locks: VoteLockData[]
  successfulFetch: boolean
}

export type VoteLock = {
  amount: BigNumber
  end: BigNumber
}

export type TokenData = {
  token: string
  oracle: string
  min: BigNumber
  max: BigNumber
}
