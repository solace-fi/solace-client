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

type ContractsContextType = {
  keyContracts: {
    solace?: Contract | null
    xSolace?: Contract | null
    xSolaceV1?: Contract | null
    xsLocker?: Contract | null
    stakingRewardsV2?: Contract | null
    xSolaceMigrator?: Contract | null
    depositHelper?: Contract | null
    gaugeController?: Contract | null
    uwLockVoting?: Contract | null
    uwLocker?: Contract | null
    uwp?: Contract | null
    uwe?: Contract | null
    fluxMegaOracle?: Contract | null
    solaceMegaOracle?: Contract | null
    bribeController?: Contract | null
    migration?: Contract | null
    migrationV2?: Contract | null
  }
  tellers: (BondTellerContractData & {
    metadata: TellerTokenMetadata
  })[]
  contractSources: ContractSources[]
}

const ContractsContext = createContext<ContractsContextType>({
  keyContracts: {
    solace: undefined,
    xSolace: undefined,
    xSolaceV1: undefined,
    xsLocker: undefined,
    stakingRewardsV2: undefined,
    xSolaceMigrator: undefined,
    depositHelper: undefined,
    gaugeController: undefined,
    uwLockVoting: undefined,
    uwLocker: undefined,
    uwp: undefined,
    uwe: undefined,
    fluxMegaOracle: undefined,
    solaceMegaOracle: undefined,
    bribeController: undefined,
    migration: undefined,
    migrationV2: undefined,
  },
  tellers: [],
  contractSources: [],
})

const ContractsProvider: React.FC = (props) => {
  const { activeNetwork } = useNetwork()
  const contractSources = useContractArray(activeNetwork)
  const keyContracts = useMemo(() => activeNetwork.config.keyContracts, [activeNetwork])

  const solace = useGetContract(keyContracts.solace)
  const xSolace = useGetContract(keyContracts.xSolace)
  const xSolaceV1 = useGetContract(keyContracts.xSolaceV1)
  const xsLocker = useGetContract(keyContracts.xsLocker)
  const stakingRewardsV2 = useGetContract(keyContracts.stakingRewardsV2)
  const xSolaceMigrator = useGetContract(keyContracts.xSolaceMigrator)
  const tellers = useGetBondTellerContracts()
  const depositHelper = useGetContract(keyContracts.depositHelper)
  const gaugeController = useGetContract(keyContracts.gaugeController)
  const uwLockVoting = useGetContract(keyContracts.uwLockVoting)
  const uwLocker = useGetContract(keyContracts.uwLocker)
  const uwp = useGetContract(keyContracts.uwp)
  const uwe = useGetContract(keyContracts.uwe)
  const fluxMegaOracle = useGetContract(keyContracts.fluxMegaOracle)
  const solaceMegaOracle = useGetContract(keyContracts.solaceMegaOracle)
  const bribeController = useGetContract(keyContracts.bribeController)
  const migration = useGetContract(keyContracts.migration)
  const migrationV2 = useGetContract(keyContracts.migrationV2)

  const value = useMemo<ContractsContextType>(
    () => ({
      keyContracts: {
        solace,
        xSolace,
        xSolaceV1,
        xsLocker,
        stakingRewardsV2,
        xSolaceMigrator,
        depositHelper,
        gaugeController,
        uwLockVoting,
        uwLocker,
        uwp,
        uwe,
        fluxMegaOracle,
        solaceMegaOracle,
        bribeController,
        migration,
        migrationV2,
      },
      tellers,
      contractSources,
    }),
    [
      solace,
      xSolace,
      xSolaceV1,
      xsLocker,
      stakingRewardsV2,
      xSolaceMigrator,
      tellers,
      depositHelper,
      gaugeController,
      uwLockVoting,
      uwLocker,
      uwp,
      uwe,
      fluxMegaOracle,
      bribeController,
      solaceMegaOracle,
      contractSources,
      migration,
      migrationV2,
    ]
  )

  return <ContractsContext.Provider value={value}>{props.children}</ContractsContext.Provider>
}

// To get access to this Manager, import this into your component or hook
export function useContracts(): ContractsContextType {
  return useContext(ContractsContext)
}

const ContractsManager: React.FC = (props) => {
  return <ContractsProvider>{props.children}</ContractsProvider>
}

export default ContractsManager
