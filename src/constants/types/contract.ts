import { Contract } from '@ethersproject/contracts'
import { TellerToken } from '.'

export type ProductContract = {
  name: string
  contract: Contract
}

export type BondTellerContract = TellerToken & {
  name: string
  contract: Contract
}

export type ContractSources = { addr: string; abi: any }
