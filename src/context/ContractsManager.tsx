import React, { createContext, useContext, useMemo, useState } from 'react'
import { Contract } from '@ethersproject/contracts'
import { contractConfig } from '../config/chainConfig'

import { useGetContract, useGetProductContracts } from '../hooks/useContract'
import { useWallet } from './WalletManager'
import { DEFAULT_CHAIN_ID } from '../constants'

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
  claimsEscrow?: Contract | null
  policyManager?: Contract | null
  products?: { name: string; id: string; contract: Contract; signer: boolean }[] | null
  selectedProtocol: Contract | null
  getProtocolByName: (productName: string) => Contract | null
  setSelectedProtocolByName: (productName: string) => void
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
  claimsEscrow: undefined,
  policyManager: undefined,
  products: undefined,
  selectedProtocol: null,
  getProtocolByName: () => null,
  setSelectedProtocolByName: () => undefined,
})

const ContractsProvider: React.FC = (props) => {
  const [selectedProtocol, setSelectedProtocol] = useState<Contract | null>(null)
  const { chainId } = useWallet()
  const config = chainId && contractConfig[chainId] ? contractConfig[chainId] : contractConfig[DEFAULT_CHAIN_ID]
  const keyContracts = config.keyContracts

  const master = useGetContract(keyContracts.master.addr, keyContracts.master.abi)
  const vault = useGetContract(keyContracts.vault.addr, keyContracts.vault.abi)
  const solace = useGetContract(keyContracts.solace.addr, keyContracts.solace.abi)
  const cpFarm = useGetContract(keyContracts.cpFarm.addr, keyContracts.cpFarm.abi)
  const lpFarm = useGetContract(keyContracts.lpFarm.addr, keyContracts.lpFarm.abi)
  const registry = useGetContract(keyContracts.registry.addr, keyContracts.registry.abi)
  const lpToken = useGetContract(keyContracts.lpToken.addr, keyContracts.lpToken.abi)
  const weth = useGetContract(keyContracts.weth.addr, keyContracts.weth.abi)
  const claimsEscrow = useGetContract(keyContracts.claimsEscrow.addr, keyContracts.claimsEscrow.abi)
  const policyManager = useGetContract(keyContracts.policyManager.addr, keyContracts.policyManager.abi)
  const products = useGetProductContracts()

  const getProtocolByName = (productName: string): Contract | null => {
    const foundProduct = products?.filter((product) => product.name == productName)
    if (foundProduct && foundProduct.length > 0) return foundProduct[0].contract
    return null
  }

  const setSelectedProtocolByName = (productName: string) => {
    setSelectedProtocol(getProtocolByName(productName))
  }

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
      claimsEscrow,
      policyManager,
      products,
      selectedProtocol,
      getProtocolByName,
      setSelectedProtocolByName,
    }),
    [
      master,
      vault,
      solace,
      cpFarm,
      lpFarm,
      registry,
      lpToken,
      weth,
      claimsEscrow,
      policyManager,
      products,
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
