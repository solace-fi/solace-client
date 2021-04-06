import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'

import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'

function useContract(address: string | undefined, abi: any, hasSigner = true): Contract | null {
  const { library, account } = useWeb3React()

  return useMemo(() => {
    if (!address || !abi || !library) return null
    try {
      return getContract(address, abi, library, hasSigner && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, abi, library, hasSigner, account])
}

export function useMasterContract(address: string | undefined, hasSigner?: boolean): Contract | null {
  return useContract(address, masterABI, hasSigner)
}

export function useRegistryContract(address: string | undefined, hasSigner?: boolean): Contract | null {
  return useContract(address, registryABI, hasSigner)
}

export function useSolaceContract(address: string | undefined, hasSigner?: boolean): Contract | null {
  return useContract(address, solaceABI, hasSigner)
}

export function useTreasuryContract(address: string | undefined, hasSigner?: boolean): Contract | null {
  return useContract(address, treasuryABI, hasSigner)
}

export function useVaultContract(address: string | undefined, hasSigner?: boolean): Contract | null {
  return useContract(address, vaultABI, hasSigner)
}
