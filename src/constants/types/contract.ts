import { Contract } from '@ethersproject/contracts'
import { BondTellerType } from '@solace-fi/sdk-nightly'

export type BondTellerContractData = { contract: Contract; type: BondTellerType }

export type ContractSources = { addr: string; abi: any; additionalInfo?: string }
