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
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import lpFarmABI from '../constants/abi/contracts/UniswapLpFarm.sol/UniswapLpFarm.json'

import {
  SOLACE_CONTRACT_ADDRESS,
  WETH_CONTRACT_ADDRESS,
  MASTER_CONTRACT_ADDRESS,
  VAULT_CONTRACT_ADDRESS,
  CPFARM_CONTRACT_ADDRESS,
  UNISWAP_FACTORY_CONTRACT_ADDRESS,
  UNISWAP_ROUTER_CONTRACT_ADDRESS,
  UNISWAP_LPTOKEN_CONTRACT_ADDRESS,
  UNISWAP_POOL_CONTRACT_ADDRESS,
  LPFARM_CONTRACT_ADDRESS,
  TREASURY_CONTRACT_ADDRESS,
  REGISTRY_CONTRACT_ADDRESS,
} from '../constants'

export function useContract(address: string, abi: any, hasSigner = true): Contract | null {
  const { library, account } = useWallet()

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

export function useMasterContract(hasSigner?: boolean): Contract | null {
  return useContract(MASTER_CONTRACT_ADDRESS ? MASTER_CONTRACT_ADDRESS : AddressZero, masterABI, hasSigner)
}

export function useRegistryContract(address: string, hasSigner?: boolean): Contract | null {
  return useContract(address, registryABI, hasSigner)
}

export function useSolaceContract(hasSigner?: boolean): Contract | null {
  return useContract(SOLACE_CONTRACT_ADDRESS ? SOLACE_CONTRACT_ADDRESS : AddressZero, solaceABI, hasSigner)
}

export function useTreasuryContract(address: string, hasSigner?: boolean): Contract | null {
  return useContract(address, treasuryABI, hasSigner)
}

export function useVaultContract(hasSigner?: boolean): Contract | null {
  return useContract(VAULT_CONTRACT_ADDRESS ? VAULT_CONTRACT_ADDRESS : AddressZero, vaultABI, hasSigner)
}

export function useCpFarmContract(hasSigner?: boolean): Contract | null {
  return useContract(CPFARM_CONTRACT_ADDRESS ? CPFARM_CONTRACT_ADDRESS : AddressZero, cpFarmABI, hasSigner)
}

export function useLpFarmContract(hasSigner?: boolean): Contract | null {
  return useContract(LPFARM_CONTRACT_ADDRESS ? LPFARM_CONTRACT_ADDRESS : AddressZero, lpFarmABI, hasSigner)
}

export function useUniswapLpTokenContract(hasSigner?: boolean): Contract | null {
  return useContract(
    UNISWAP_LPTOKEN_CONTRACT_ADDRESS ? UNISWAP_LPTOKEN_CONTRACT_ADDRESS : AddressZero,
    lpFarmABI,
    hasSigner
  )
}
