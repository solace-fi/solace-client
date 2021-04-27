import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { Contract } from '@ethersproject/contracts'

import {
  useMasterContract,
  useVaultContract,
  useSolaceContract,
  useCpFarmContract,
  useLpFarmContract,
  useRegistryContract,
} from '../hooks/useContract'

export type Contracts = {
  master?: Contract | null
  vault?: Contract | null
  solace?: Contract | null
  cpFarm?: Contract | null
  lpFarm?: Contract | null
  registry?: Contract | null
}

const ContractsContext = createContext<Contracts>({
  master: undefined,
  vault: undefined,
  solace: undefined,
  cpFarm: undefined,
  lpFarm: undefined,
  registry: undefined,
})

const ContractsProvider: React.FC = (props) => {
  const master = useMasterContract()
  const vault = useVaultContract()
  const solace = useSolaceContract()
  const cpFarm = useCpFarmContract()
  const lpFarm = useLpFarmContract()
  const registry = useRegistryContract()

  const value = useMemo<Contracts>(
    () => ({
      master: master,
      vault: vault,
      solace: solace,
      cpFarm: cpFarm,
      lpFarm: lpFarm,
      registry: registry,
    }),
    [master, vault, solace, cpFarm, lpFarm, registry]
  )

  return <ContractsContext.Provider value={value}>{props.children}</ContractsContext.Provider>
}

export function useContracts(): Contracts {
  return useContext(ContractsContext)
}

const ContractsManager: React.FC = (props) => {
  return <ContractsProvider>{props.children}</ContractsProvider>
}

export default ContractsManager
