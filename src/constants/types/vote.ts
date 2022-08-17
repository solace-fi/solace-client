import { BigNumber } from '@solace-fi/sdk-nightly'

export type Vote = {
  gaugeID: BigNumber
  votePowerBPS: BigNumber
}

export type VotesData = {
  votePower: BigNumber
  usedVotePowerBPS: BigNumber
  localVoteAllocation: VoteAllocation[]
  localVoteAllocationTotal: number
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
