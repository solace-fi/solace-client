import { TransactionCondition, SystemNotice, Error } from '../enums'
import { BigNumber, SolaceRiskProtocol } from '@solace-fi/sdk-nightly'

export type CheckboxData = { id: string; checked: boolean }

export type WindowDimensions = {
  width: number
  height: number
  isDesktop: boolean
  isMobile: boolean
  ifDesktop: <T, V>(desktopArg: T, mobileArg?: V | undefined) => T | V | undefined
  ifMobile: <T, V>(mobileArg: T, desktopArg?: V | undefined) => T | V | undefined
}

export type LocalTx = {
  hash: any
  type: string
  status: TransactionCondition
}

export type TxResult = {
  tx: any | null
  localTx: LocalTx | null
}

export type ErrorData = {
  type: Error
  metadata: string
  uniqueId: string
}

export type SystemNoticeData = {
  type: SystemNotice
  metadata: string
  uniqueId: string
}

export type PageInfo = {
  name: string
  title: string
  to: string
  icon: JSX.Element
  component: () => any
}

export type LocalSolaceRiskProtocol = SolaceRiskProtocol & {
  index: number
  networks: string[]
}

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

export type Vote = {
  gaugeID: BigNumber
  votePowerBPS: BigNumber
}

export type VoteLock = {
  amount: BigNumber
  end: BigNumber
}

export type VotesData = {
  votePower: BigNumber
  usedVotePower: BigNumber
  voteAllocation: {
    gauge: string
    votes: string
    added: boolean
    changed: boolean
  }[]
}

export type TokenData = {
  token: string
  oracle: string
  min: BigNumber
  max: BigNumber
}
