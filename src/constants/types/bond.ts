import { BigNumber } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { BondTellerContract } from './contract'

export type BondToken = {
  id: BigNumber
  payoutToken: string
  payoutAmount: BigNumber
  pricePaid: BigNumber
  maturation: BigNumber
}

export type BondTellerDetails = {
  tellerData: BondTellerData
  principalData: BondPrincipalData
}

export type BondTellerData = {
  teller: BondTellerContract
  principalAddr: string
  bondPrice: BigNumber
  usdBondPrice: number
  vestingTermInSeconds: number
  capacity: BigNumber
  maxPayout: BigNumber
  bondFeeBps: BigNumber
  bondRoi: number
}

export type BondPrincipalData = {
  principal: Contract
  principalProps: {
    symbol: string
    decimals: number
    name: string
  }
  token0?: string
  token1?: string
}
