import { Contract } from '@ethersproject/contracts'

export type BondTellerContractData = { contract: Contract; type: 'erc20' | 'eth' | 'matic' }

export type ContractSources = { addr: string; abi: any; additionalInfo?: string }
