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
  keyContracts: {
    farmController?: Contract | null
    farmRewards?: Contract | null
    vault?: Contract | null
    solace?: Contract | null
    xSolace?: Contract | null
    xSolaceV1?: Contract | null
    xSolaceMigrator?: Contract | null
    cpFarm?: Contract | null
    bondDepo?: Contract | null
    claimsEscrow?: Contract | null
    policyManager?: Contract | null
    riskManager?: Contract | null
  }
  products: ProductContract[]
  tellers: BondTellerContract[]
  contractSources: ContractSources[]
  selectedProtocol: Contract | undefined
  getProtocolByName: (productName: string) => Contract | undefined
  setSelectedProtocolByName: (productName: string) => void
}

const ContractsContext = createContext<Contracts>({
  keyContracts: {
    farmController: undefined,
    farmRewards: undefined,
    vault: undefined,
    solace: undefined,
    xSolace: undefined,
    xSolaceV1: undefined,
    xSolaceMigrator: undefined,
    cpFarm: undefined,
    bondDepo: undefined,
    claimsEscrow: undefined,
    policyManager: undefined,
    riskManager: undefined,
  },
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
  const farmRewards = useGetContract(keyContracts.farmRewards)
  const vault = useGetContract(keyContracts.vault)
  const solace = useGetContract(keyContracts.solace)
  const xSolace = useGetContract(keyContracts.xSolace)
  const xSolaceV1 = useGetContract(keyContracts.xSolaceV1)
  const xSolaceMigrator = useGetContract(keyContracts.xSolaceMigrator)
  const cpFarm = useGetContract(keyContracts.cpFarm)
  const claimsEscrow = useGetContract(keyContracts.claimsEscrow)
  const policyManager = useGetContract(keyContracts.policyManager)
  const riskManager = useGetContract(keyContracts.riskManager)
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
      keyContracts: {
        farmController,
        farmRewards,
        vault,
        solace,
        xSolace,
        xSolaceV1,
        xSolaceMigrator,
        cpFarm,
        bondDepo,
        claimsEscrow,
        policyManager,
        riskManager,
      },
      products,
      tellers,
      contractSources,
      selectedProtocol,
      getProtocolByName,
      setSelectedProtocolByName,
    }),
    [
      farmController,
      farmRewards,
      vault,
      solace,
      xSolace,
      xSolaceV1,
      xSolaceMigrator,
      cpFarm,
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
