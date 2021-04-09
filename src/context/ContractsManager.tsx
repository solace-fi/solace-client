import React from 'react'
import { useMaster, MasterContract } from '../ethers/contracts/Master'
import { useVault, VaultContract } from '../ethers/contracts/Vault'

import { useWallet } from '../context/Web3Manager'

export type ContractsData = {
  master: MasterContract
  vault: VaultContract
}

const ContractsContext = React.createContext<ContractsData>({} as any)

export function useContracts(): ContractsData {
  return React.useContext(ContractsContext)
}

const ContractsProvider: React.FC = ({ children }) => {
  const wallet = useWallet()
  const masterContract = useMaster()
  const vaultContract = useVault()

  const value = {
    master: masterContract,
    vault: vaultContract,
  }

  return <ContractsContext.Provider value={value}>{children}</ContractsContext.Provider>
}

export default ContractsProvider
