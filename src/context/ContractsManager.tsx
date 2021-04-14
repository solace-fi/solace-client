import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useMasterContract, useVaultContract, useSolaceContract } from '../hooks/useContract'

export type Contracts = {
  master?: Contract
  vault?: Contract
  solace?: Contract
}

const ContractsContext = createContext<Contracts>({
  master: undefined,
  vault: undefined,
  solace: undefined,
})

const ContractsProvider: React.FC = (props) => {
  const master = useMasterContract()
  const vault = useVaultContract()
  const solace = useSolaceContract()

  const value = useMemo<Contracts>(
    () => ({
      master: master,
      vault: vault,
      solace: solace,
    }),
    [master, vault, solace]
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
