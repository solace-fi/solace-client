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
    depositHelper?: Contract | null
    gaugeController?: Contract | null
    uwLockVoting?: Contract | null
    uwLocker?: Contract | null
    uwp?: Contract | null
    uwe?: Contract | null
    fluxMegaOracle?: Contract | null
    solaceMegaOracle?: Contract | null
    bribeController?: Contract | null
  }
  contractSources: ContractSources[]
}

const ContractsContext = createContext<Contracts>({
  keyContracts: {
    solace: undefined,
    depositHelper: undefined,
    gaugeController: undefined,
    uwLockVoting: undefined,
    uwLocker: undefined,
    uwp: undefined,
    uwe: undefined,
    fluxMegaOracle: undefined,
    solaceMegaOracle: undefined,
    bribeController: undefined,
  },
  contractSources: [],
})

const ContractsProvider: React.FC = (props) => {
  const { activeNetwork } = useNetwork()
  const contractSources = useContractArray()
  const keyContracts = useMemo(() => activeNetwork.config.keyContracts, [activeNetwork])

  const solace = useGetContract(keyContracts.solace)
  const depositHelper = useGetContract(keyContracts.depositHelper)
  const gaugeController = useGetContract(keyContracts.gaugeController)
  const uwLockVoting = useGetContract(keyContracts.uwLockVoting)
  const uwLocker = useGetContract(keyContracts.uwLocker)
  const uwp = useGetContract(keyContracts.uwp)
  const uwe = useGetContract(keyContracts.uwe)
  const fluxMegaOracle = useGetContract(keyContracts.fluxMegaOracle)
  const solaceMegaOracle = useGetContract(keyContracts.solaceMegaOracle)
  const bribeController = useGetContract(keyContracts.bribeController)

  const value = useMemo<Contracts>(
    () => ({
      keyContracts: {
        solace,
        depositHelper,
        gaugeController,
        uwLockVoting,
        uwLocker,
        uwp,
        uwe,
        fluxMegaOracle,
        solaceMegaOracle,
        bribeController,
      },
      contractSources,
    }),
    [
      solace,
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
