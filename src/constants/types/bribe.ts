import { BigNumber } from 'ethers'
import { VoteForGauge } from '.'

export type Bribe = {
  bribeToken: string
  bribeAmount: BigNumber
}

export type GaugeBribeInfo = {
  gaugeID: BigNumber
  bribes: Bribe[]
  votes: VoteForGauge[]
}
