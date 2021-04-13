import { useWallet } from '../context/Web3Manager'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'

import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'

const MASTER_CONTRACT_ADDRESS = process.env.REACT_APP_MASTER_CONTRACT_ADDRESS
const VAULT_CONTRACT_ADDRESS = process.env.REACT_APP_VAULT_CONTRACT_ADDRESS

export function useContract(address: string, abi: any, hasSigner = true): Contract {
  const { library, account } = useWallet()

  return useMemo(() => {
    return getContract(address, abi, library, hasSigner && account ? account : undefined)
  }, [address, abi, library, hasSigner, account])
}

export function useMasterContract(hasSigner?: boolean): Contract {
  return useContract(MASTER_CONTRACT_ADDRESS ? MASTER_CONTRACT_ADDRESS : AddressZero, masterABI, hasSigner)
}

export function useRegistryContract(address: string, hasSigner?: boolean): Contract {
  return useContract(address, registryABI, hasSigner)
}

export function useSolaceContract(address: string, hasSigner?: boolean): Contract {
  return useContract(address, solaceABI, hasSigner)
}

export function useTreasuryContract(address: string, hasSigner?: boolean): Contract {
  return useContract(address, treasuryABI, hasSigner)
}

export function useVaultContract(hasSigner?: boolean): Contract {
  return useContract(VAULT_CONTRACT_ADDRESS ? VAULT_CONTRACT_ADDRESS : AddressZero, vaultABI, hasSigner)
}
