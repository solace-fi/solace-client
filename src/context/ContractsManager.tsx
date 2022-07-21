import React, { createContext, useContext, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useContractArray, useGetContract } from '../hooks/contract/useContract'
import { ContractSources } from '../constants/types'
import { useNetwork } from './NetworkManager'

/*

This manager supplies the Contracts data all across the application, it is here where
the web application mainly reads the contracts.

*/

type Contracts = {
  keyContracts: {
    solace?: Contract | null
    xSolace?: Contract | null
    xSolaceV1?: Contract | null
    xsLocker?: Contract | null
    stakingRewardsV2?: Contract | null
    xSolaceMigrator?: Contract | null
  }
  contractSources: ContractSources[]
}

const ContractsContext = createContext<Contracts>({
  keyContracts: {
    solace: undefined,
    xSolace: undefined,
    xSolaceV1: undefined,
    xsLocker: undefined,
    stakingRewardsV2: undefined,
    xSolaceMigrator: undefined,
  },
  contractSources: [],
})

const ContractsProvider: React.FC = (props) => {
  const { activeNetwork } = useNetwork()
  const contractSources = useContractArray()
  const keyContracts = useMemo(() => activeNetwork.config.keyContracts, [activeNetwork])

  const solace = useGetContract(keyContracts.solace)
  const xSolace = useGetContract(keyContracts.xSolace)
  const xSolaceV1 = useGetContract(keyContracts.xSolaceV1)
  const xsLocker = useGetContract(keyContracts.xsLocker)
  const stakingRewardsV2 = useGetContract(keyContracts.stakingRewardsV2)
  const xSolaceMigrator = useGetContract(keyContracts.xSolaceMigrator)

  const value = useMemo<Contracts>(
    () => ({
      keyContracts: {
        solace,
        xSolace,
        xSolaceV1,
        xsLocker,
        stakingRewardsV2,
        xSolaceMigrator,
      },
      contractSources,
    }),
    [solace, xSolace, xSolaceV1, xsLocker, stakingRewardsV2, xSolaceMigrator, contractSources]
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
