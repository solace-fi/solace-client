import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Contract } from '@ethersproject/contracts'

import {
  useContractArray,
  useGetBondTellerContracts,
  useGetContract,
  useGetProductContracts,
} from '../hooks/contract/useContract'
import { BondTellerContractData, ContractSources, ProductContract, TellerTokenMetadata } from '../constants/types'
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
    xsLocker?: Contract | null
    stakingRewards?: Contract | null
    xSolaceMigrator?: Contract | null
    cpFarm?: Contract | null
    claimsEscrow?: Contract | null
    policyManager?: Contract | null
    riskManager?: Contract | null
    solaceCoverProduct?: Contract | null
  }
  products: ProductContract[]
  tellers: (BondTellerContractData & {
    metadata: TellerTokenMetadata
  })[]
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
    xsLocker: undefined,
    stakingRewards: undefined,
    xSolaceMigrator: undefined,
    cpFarm: undefined,
    claimsEscrow: undefined,
    policyManager: undefined,
    riskManager: undefined,
    solaceCoverProduct: undefined,
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
  const xsLocker = useGetContract(keyContracts.xsLocker)
  const stakingRewards = useGetContract(keyContracts.stakingRewards)
  const xSolaceMigrator = useGetContract(keyContracts.xSolaceMigrator)
  const cpFarm = useGetContract(keyContracts.cpFarm)
  const claimsEscrow = useGetContract(keyContracts.claimsEscrow)
  const policyManager = useGetContract(keyContracts.policyManager)
  const riskManager = useGetContract(keyContracts.riskManager)
  const solaceCoverProduct = useGetContract(keyContracts.solaceCoverProduct)
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
        xsLocker,
        stakingRewards,
        xSolaceMigrator,
        cpFarm,
        claimsEscrow,
        policyManager,
        riskManager,
        solaceCoverProduct,
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
      xsLocker,
      stakingRewards,
      xSolaceMigrator,
      cpFarm,
      claimsEscrow,
      policyManager,
      riskManager,
      solaceCoverProduct,
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
