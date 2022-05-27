import { BigNumber } from 'ethers'
import { BondTellerDetails, BondTokenData } from '@solace-fi/sdk-nightly'

export type BondTokenV1 = {
  id: BigNumber
  payoutToken: string
  payoutAmount: BigNumber
  pricePaid: BigNumber
  maturation: BigNumber
}

export type BondTokenV2 = BondTokenData & {
  id: BigNumber
}

export type BondTellerFullDetails = BondTellerDetails & {
  metadata: TellerTokenMetadata
}

export type TellerTokenMetadata = {
  name: string
  addr: string
  tellerAbi: any
  principalAbi: any
  mainnetAddr: string
  tokenId: string
  isBondTellerErc20: boolean
  version: number
  isLp?: boolean
  sdk?: string
  isDisabled?: boolean
  cannotBuy?: boolean
}
