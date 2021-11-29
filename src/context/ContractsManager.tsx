import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Contract } from '@ethersproject/contracts'

import {
  useContractArray,
  useGetBondTellerContracts,
  useGetContract,
  useGetProductContracts,
} from '../hooks/useContract'
import { BondTellerContract, ContractSources, ProductContract } from '../constants/types'
import { useNetwork } from './NetworkManager'

/*

This manager supplies the Contracts data all across the application, it is here where
the web application mainly reads the contracts.

*/

type Contracts = {
  farmController?: Contract | null
  optionsFarming?: Contract | null
  vault?: Contract | null
  treasury?: Contract | null
  solace?: Contract | null
  xSolace?: Contract | null
  cpFarm?: Contract | null
  lpFarm?: Contract | null
  registry?: Contract | null
  lpToken?: Contract | null
  lpAppraisor?: Contract | null
  bondDepo?: Contract | null
  claimsEscrow?: Contract | null
  policyManager?: Contract | null
  riskManager?: Contract | null
  products: ProductContract[]
  tellers: BondTellerContract[]
  contractSources: ContractSources[]
  selectedProtocol: Contract | undefined
  getProtocolByName: (productName: string) => Contract | undefined
  setSelectedProtocolByName: (productName: string) => void
}

const ContractsContext = createContext<Contracts>({
  farmController: undefined,
  optionsFarming: undefined,
  vault: undefined,
  treasury: undefined,
  solace: undefined,
  xSolace: undefined,
  cpFarm: undefined,
  lpFarm: undefined,
  registry: undefined,
  lpToken: undefined,
  lpAppraisor: undefined,
  bondDepo: undefined,
  claimsEscrow: undefined,
  policyManager: undefined,
  riskManager: undefined,
  products: [],
  tellers: [],
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

  const farmController = useGetContract(keyContracts.farmController)
  const optionsFarming = useGetContract(keyContracts.optionsFarming)
  const vault = useGetContract(keyContracts.vault)
  const treasury = useGetContract(keyContracts.treasury)
  const solace = useGetContract(keyContracts.solace)
  const xSolace = useGetContract(keyContracts.xSolace)
  const cpFarm = useGetContract(keyContracts.cpFarm)
  const lpFarm = useGetContract(keyContracts.lpFarm)
  const registry = useGetContract(keyContracts.registry)
  const lpToken = useGetContract(keyContracts.lpToken)
  const claimsEscrow = useGetContract(keyContracts.claimsEscrow)
  const policyManager = useGetContract(keyContracts.policyManager)
  const riskManager = useGetContract(keyContracts.riskManager)
  const lpAppraisor = useGetContract(keyContracts.lpAppraisor)
  const bondDepo = useGetContract(keyContracts.bondDepo)
  const products = useGetProductContracts()
  const tellers = useGetBondTellerContracts()

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
      farmController,
      optionsFarming,
      vault,
      treasury,
      solace,
      xSolace,
      cpFarm,
      lpFarm,
      registry,
      lpToken,
      lpAppraisor,
      bondDepo,
      claimsEscrow,
      policyManager,
      riskManager,
      products,
      tellers,
      contractSources,
      selectedProtocol,
      getProtocolByName,
      setSelectedProtocolByName,
    }),
    [
      farmController,
      optionsFarming,
      vault,
      treasury,
      solace,
      xSolace,
      cpFarm,
      lpFarm,
      registry,
      lpToken,
      lpAppraisor,
      bondDepo,
      claimsEscrow,
      policyManager,
      riskManager,
      products,
      tellers,
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
