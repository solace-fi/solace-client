import React, { useState, createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useMasterContract, useVaultContract, useSolaceContract, useErc20FarmContract } from '../hooks/useContract'

export type Contracts = {
  master?: Contract
  vault?: Contract
  solace?: Contract
  erc20farm?: Contract
}

const ContractsContext = createContext<Contracts>({
  master: undefined,
  vault: undefined,
  solace: undefined,
  erc20farm: undefined,
})

const ContractsProvider: React.FC = (props) => {
  const master = useMasterContract()
  const vault = useVaultContract()
  const solace = useSolaceContract()
  const erc20farm = useErc20FarmContract()

  const value = useMemo<Contracts>(
    () => ({
      master: master,
      vault: vault,
      solace: solace,
      erc20farm: erc20farm,
    }),
    [master, vault, solace, erc20farm]
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
