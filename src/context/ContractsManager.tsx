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
    gaugeController?: Contract | null
    uwpLockVoting?: Contract | null
    uwpLocker?: Contract | null
    uwp?: Contract | null
    uwe?: Contract | null
    fluxMegaOracle?: Contract | null
  }
  contractSources: ContractSources[]
}

const ContractsContext = createContext<Contracts>({
  keyContracts: {
    solace: undefined,
    gaugeController: undefined,
    uwpLockVoting: undefined,
    uwpLocker: undefined,
    uwp: undefined,
    uwe: undefined,
    fluxMegaOracle: undefined,
  },
  contractSources: [],
})

const ContractsProvider: React.FC = (props) => {
  const { activeNetwork } = useNetwork()
  const contractSources = useContractArray()
  const keyContracts = useMemo(() => activeNetwork.config.keyContracts, [activeNetwork])

  const solace = useGetContract(keyContracts.solace)
  const gaugeController = useGetContract(keyContracts.gaugeController)
  const uwpLockVoting = useGetContract(keyContracts.uwpLockVoting)
  const uwpLocker = useGetContract(keyContracts.uwpLocker)
  const uwp = useGetContract(keyContracts.uwp)
  const uwe = useGetContract(keyContracts.uwe)
  const fluxMegaOracle = useGetContract(keyContracts.fluxMegaOracle)

  const value = useMemo<Contracts>(
    () => ({
      keyContracts: {
        solace,
        gaugeController,
        uwpLockVoting,
        uwpLocker,
        uwp,
        uwe,
        fluxMegaOracle,
      },
      contractSources,
    }),
    [solace, gaugeController, uwpLockVoting, uwpLocker, uwp, uwe, fluxMegaOracle, contractSources]
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
