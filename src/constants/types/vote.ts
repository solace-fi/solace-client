import { BigNumber } from '@solace-fi/sdk-nightly'

export type Vote = {
  gaugeID: BigNumber
  votePowerBPS: BigNumber
}

export type VoteForGauge = {
  voter: string
  votePowerBPS: BigNumber
}

export type VotesData = {
  votePower: BigNumber
  usedVotePowerBPS: BigNumber
  localVoteAllocation: VoteAllocation[]
  localVoteAllocationPercentageTotal: number
}

export type DelegatorVotesData = VotesData & {
  delegator: string
}

export type VoteAllocation = {
  gauge: string
  gaugeId: BigNumber
  votePowerPercentage: string
  added: boolean
  changed: boolean
  gaugeActive: boolean
}

export type GaugeData = {
  gaugeId: BigNumber
  gaugeName: string
  gaugeWeight: BigNumber
  isActive: boolean
}
