import React, { createContext, useContext, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'

import {
  useMasterContract,
  useVaultContract,
  useSolaceContract,
  useCpFarmContract,
  useLpFarmContract,
  useRegistryContract,
  useLpTokenContract,
  useWethContract,
  useCompoundProductContract,
} from '../hooks/useContract'

/*

This manager supplies the Contracts data all across the application, it is here where
the web application mainly reads the contracts.

*/

export type Contracts = {
  master?: Contract | null
  vault?: Contract | null
  solace?: Contract | null
  cpFarm?: Contract | null
  lpFarm?: Contract | null
  registry?: Contract | null
  lpToken?: Contract | null
  weth?: Contract | null
  compProduct?: Contract | null
}

const ContractsContext = createContext<Contracts>({
  master: undefined,
  vault: undefined,
  solace: undefined,
  cpFarm: undefined,
  lpFarm: undefined,
  registry: undefined,
  lpToken: undefined,
  weth: undefined,
  compProduct: undefined,
})

const ContractsProvider: React.FC = (props) => {
  const master = useMasterContract()
  const vault = useVaultContract()
  const solace = useSolaceContract()
  const cpFarm = useCpFarmContract()
  const lpFarm = useLpFarmContract()
  const registry = useRegistryContract()
  const lpToken = useLpTokenContract()
  const weth = useWethContract()
  const compProduct = useCompoundProductContract()

  // update when a contract changes
  const value = useMemo<Contracts>(
    () => ({
      master,
      vault,
      solace,
      cpFarm,
      lpFarm,
      registry,
      lpToken,
      weth,
      compProduct,
    }),
    [master, vault, solace, cpFarm, lpFarm, registry, lpToken, weth, compProduct]
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
