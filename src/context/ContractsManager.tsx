import React, { createContext, useContext, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useContractArray, useGetBondTellerContracts, useGetContract } from '../hooks/contract/useContract'
import { ContractSources, TellerTokenMetadata } from '../constants/types'
import { useNetwork } from './NetworkManager'
import { BondTellerContractData } from '@solace-fi/sdk-nightly'

/*

This manager supplies the Contracts data all across the application, it is here where
the web application mainly reads the contracts.

*/

type Contracts = {
  keyContracts: {
    farmController?: Contract | null
    farmRewards?: Contract | null
    vault?: Contract | null
    solace?: Contract | null
    xSolace?: Contract | null
    xSolaceV1?: Contract | null
    xsLocker?: Contract | null
    stakingRewards?: Contract | null
    xSolaceMigrator?: Contract | null
    cpFarm?: Contract | null
    solaceCoverProduct?: Contract | null
  }
  tellers: (BondTellerContractData & {
    metadata: TellerTokenMetadata
  })[]
  contractSources: ContractSources[]
}

const ContractsContext = createContext<Contracts>({
  keyContracts: {
    farmController: undefined,
    farmRewards: undefined,
    vault: undefined,
    solace: undefined,
    xSolace: undefined,
    xSolaceV1: undefined,
    xsLocker: undefined,
    stakingRewards: undefined,
    xSolaceMigrator: undefined,
    cpFarm: undefined,
    solaceCoverProduct: undefined,
  },
  tellers: [],
  contractSources: [],
})

const ContractsProvider: React.FC = (props) => {
  const { activeNetwork } = useNetwork()
  const contractSources = useContractArray()
  const keyContracts = useMemo(() => activeNetwork.config.keyContracts, [activeNetwork])

  const farmController = useGetContract(keyContracts.farmController)
  const farmRewards = useGetContract(keyContracts.farmRewards)
  const vault = useGetContract(keyContracts.vault)
  const solace = useGetContract(keyContracts.solace)
  const xSolace = useGetContract(keyContracts.xSolace)
  const xSolaceV1 = useGetContract(keyContracts.xSolaceV1)
  const xsLocker = useGetContract(keyContracts.xsLocker)
  const stakingRewards = useGetContract(keyContracts.stakingRewards)
  const xSolaceMigrator = useGetContract(keyContracts.xSolaceMigrator)
  const cpFarm = useGetContract(keyContracts.cpFarm)
  const solaceCoverProduct = useGetContract(keyContracts.solaceCoverProduct)
  const tellers = useGetBondTellerContracts()

  const value = useMemo<Contracts>(
    () => ({
      keyContracts: {
        farmController,
        farmRewards,
        vault,
        solace,
        xSolace,
        xSolaceV1,
        xsLocker,
        stakingRewards,
        xSolaceMigrator,
        cpFarm,
        solaceCoverProduct,
      },
      tellers,
      contractSources,
    }),
    [
      farmController,
      farmRewards,
      vault,
      solace,
      xSolace,
      xSolaceV1,
      xsLocker,
      stakingRewards,
      xSolaceMigrator,
      cpFarm,
      solaceCoverProduct,
      tellers,
      contractSources,
    ]
  )

  return <ContractsContext.Provider value={value}>{props.children}</ContractsContext.Provider>
}

// To get access to this Manager, import this into your component or hook
export function useContracts(): Contracts {
  return useContext(ContractsContext)
}

const ContractsManager: React.FC = (props) => {
  return <ContractsProvider>{props.children}</ContractsProvider>
}

export default ContractsManager
