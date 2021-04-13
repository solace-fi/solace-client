import { useWallet } from '../context/Web3Manager'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'

import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'

const MASTER_CONTRACT_ADDRESS = '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0'
const VAULT_CONTRACT_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'

export function useContract(address: string, abi: any, hasSigner = true): Contract {
  const { library, account } = useWallet()

  return useMemo(() => {
    return getContract(address, abi, library, hasSigner && account ? account : undefined)
  }, [address, abi, library, hasSigner, account])
}

export function useMasterContract(hasSigner?: boolean): Contract {
  return useContract(MASTER_CONTRACT_ADDRESS, masterABI, hasSigner)
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
  return useContract(VAULT_CONTRACT_ADDRESS, vaultABI, hasSigner)
}
