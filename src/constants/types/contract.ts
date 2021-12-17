import { Contract } from '@ethersproject/contracts'

export type ProductContract = {
  name: string
  contract: Contract
}

export type BondTellerContract = {
  name: string
  contract: Contract
  isBondTellerErc20: boolean
  isLp: boolean
  underlyingAddr: string
}

export type ContractSources = { addr: string; abi: any }
