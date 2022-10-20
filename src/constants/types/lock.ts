import { BigNumber } from '@solace-fi/sdk-nightly'

export type LockData = {
  lockID: BigNumber
} & Lock

export type UserVoteLocksInfo = {
  stakedBalance: BigNumber
}

export type UserVoteLocksData = {
  user: UserVoteLocksInfo
  locks: LockData[]
  successfulFetch: boolean
}

export type Lock = {
  amount: BigNumber
  end: BigNumber
}

export type TokenData = {
  token: string
  oracle: string
  min: BigNumber
  max: BigNumber
}
