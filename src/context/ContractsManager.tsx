import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useContractArray, useGetContract, useGetProductContracts } from '../hooks/useContract'
import { ContractSources, ProductContract } from '../constants/types'
import { useNetwork } from './NetworkManager'

/*

This manager supplies the Contracts data all across the application, it is here where
the web application mainly reads the contracts.

*/

type Contracts = {
  master?: Contract | null
  vault?: Contract | null
  treasury?: Contract | null
  solace?: Contract | null
  cpFarm?: Contract | null
  lpFarm?: Contract | null
  registry?: Contract | null
  lpToken?: Contract | null
  weth?: Contract | null
  lpAppraisor?: Contract | null
  claimsEscrow?: Contract | null
  policyManager?: Contract | null
  products: ProductContract[]
  contractSources: ContractSources[]
  selectedProtocol: Contract | undefined
  getProtocolByName: (productName: string) => Contract | undefined
  setSelectedProtocolByName: (productName: string) => void
}

const ContractsContext = createContext<Contracts>({
  master: undefined,
  vault: undefined,
  treasury: undefined,
  solace: undefined,
  cpFarm: undefined,
  lpFarm: undefined,
  registry: undefined,
  lpToken: undefined,
  weth: undefined,
  lpAppraisor: undefined,
  claimsEscrow: undefined,
  policyManager: undefined,
  products: [],
  contractSources: [],
  selectedProtocol: undefined,
  getProtocolByName: () => undefined,
  setSelectedProtocolByName: () => undefined,
})

const ContractsProvider: React.FC = (props) => {
  const [selectedProtocol, setSelectedProtocol] = useState<Contract | undefined>(undefined)
  const { activeNetwork } = useNetwork()
  const contractSources = useContractArray()
  const keyContracts = useMemo(() => activeNetwork.config.keyContracts, [activeNetwork])

  const master = useGetContract(keyContracts.master)
  const vault = useGetContract(keyContracts.vault)
  const treasury = useGetContract(keyContracts.treasury)
  const solace = useGetContract(keyContracts.solace)
  const cpFarm = useGetContract(keyContracts.cpFarm)
  const lpFarm = useGetContract(keyContracts.lpFarm)
  const registry = useGetContract(keyContracts.registry)
  const lpToken = useGetContract(keyContracts.lpToken)
  const weth = useGetContract(keyContracts.weth)
  const claimsEscrow = useGetContract(keyContracts.claimsEscrow)
  const policyManager = useGetContract(keyContracts.policyManager)
  const lpAppraisor = useGetContract(keyContracts.lpAppraisor)
  const products = useGetProductContracts()

  const getProtocolByName = useCallback(
    (productName: string): Contract | undefined => {
      const foundProduct = products.filter((product) => product.name == productName)
      if (foundProduct.length > 0) return foundProduct[0].contract
      return undefined
    },
    [products]
  )

  const setSelectedProtocolByName = useCallback(
    (productName: string) => {
      setSelectedProtocol(getProtocolByName(productName))
    },
    [getProtocolByName]
  )

  const value = useMemo<Contracts>(
    () => ({
      master,
      vault,
      treasury,
      solace,
      cpFarm,
      lpFarm,
      registry,
      lpToken,
      weth,
      lpAppraisor,
      claimsEscrow,
      policyManager,
      products,
      contractSources,
      selectedProtocol,
      getProtocolByName,
      setSelectedProtocolByName,
    }),
    [
      master,
      vault,
      treasury,
      solace,
      cpFarm,
      lpFarm,
      registry,
      lpToken,
      weth,
      lpAppraisor,
      claimsEscrow,
      policyManager,
      products,
      contractSources,
      selectedProtocol,
      setSelectedProtocolByName,
      getProtocolByName,
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
