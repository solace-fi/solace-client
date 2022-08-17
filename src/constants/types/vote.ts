import { BigNumber } from '@solace-fi/sdk-nightly'

export type Vote = {
  gaugeID: BigNumber
  votePowerBPS: BigNumber
}

export type VotesData = {
  votePower: BigNumber
  usedVotePower: BigNumber
  voteAllocation: VoteAllocation[]
}

export type VoteAllocation = {
  gauge: string
  gaugeId: BigNumber
  votes: string
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
