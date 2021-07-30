import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Contract } from '@ethersproject/contracts'
import { contractConfig } from '../config/chainConfig'

import { useContractArray, useGetContract, useGetProductContracts } from '../hooks/useContract'
import { useWallet } from './WalletManager'
import { ContractSources, SupportedProduct } from '../constants/types'
import { DEFAULT_CHAIN_ID } from '../constants'

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
  products: SupportedProduct[]
  contractSources: ContractSources[]
  selectedProtocol: Contract | null
  getProtocolByName: (productName: string) => Contract | null
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
  selectedProtocol: null,
  getProtocolByName: () => null,
  setSelectedProtocolByName: () => undefined,
})

const ContractsProvider: React.FC = (props) => {
  const [selectedProtocol, setSelectedProtocol] = useState<Contract | null>(null)
  const { chainId } = useWallet()
  const contractSources = useContractArray()
  const keyContracts = useMemo(() => contractConfig[String(chainId ?? DEFAULT_CHAIN_ID)].keyContracts, [chainId])

  const master = useGetContract(keyContracts.master.addr, keyContracts.master.abi)
  const vault = useGetContract(keyContracts.vault.addr, keyContracts.vault.abi)
  const treasury = useGetContract(keyContracts.treasury.addr, keyContracts.treasury.abi)
  const solace = useGetContract(keyContracts.solace.addr, keyContracts.solace.abi)
  const cpFarm = useGetContract(keyContracts.cpFarm.addr, keyContracts.cpFarm.abi)
  const lpFarm = useGetContract(keyContracts.lpFarm.addr, keyContracts.lpFarm.abi)
  const registry = useGetContract(keyContracts.registry.addr, keyContracts.registry.abi)
  const lpToken = useGetContract(keyContracts.lpToken.addr, keyContracts.lpToken.abi)
  const weth = useGetContract(keyContracts.weth.addr, keyContracts.weth.abi)
  const claimsEscrow = useGetContract(keyContracts.claimsEscrow.addr, keyContracts.claimsEscrow.abi)
  const policyManager = useGetContract(keyContracts.policyManager.addr, keyContracts.policyManager.abi)
  const lpAppraisor = useGetContract(keyContracts.lpAppraisor.addr, keyContracts.lpAppraisor.abi)
  const products = useGetProductContracts()

  const getProtocolByName = useCallback(
    (productName: string): Contract | null => {
      const foundProduct = products.filter((product) => product.name == productName)
      if (foundProduct.length > 0) return foundProduct[0].contract
      return null
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
