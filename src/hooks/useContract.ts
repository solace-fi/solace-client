import { useWallet } from '../context/WalletManager'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'

import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import wethABI from '../constants/abi/contracts/mocks/WETH9.sol/WETH9.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import lpFarmABI from '../constants/abi/contracts/SolaceEthLpFarm.sol/SolaceEthLpFarm.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'

import compAbi from '../constants/abi/contracts/products/CompoundProductRinkeby.sol/CompoundProductRinkeby.json'

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
  ADDRESS_ZERO,
  COMPOUND_PRODUCT_CONTRACT_ADDRESS,
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
  return useContract(MASTER_CONTRACT_ADDRESS ? MASTER_CONTRACT_ADDRESS : ADDRESS_ZERO, masterABI, hasSigner)
}

export function useSolaceContract(hasSigner?: boolean): Contract | null {
  return useContract(SOLACE_CONTRACT_ADDRESS ? SOLACE_CONTRACT_ADDRESS : ADDRESS_ZERO, solaceABI, hasSigner)
}

export function useWethContract(hasSigner?: boolean): Contract | null {
  return useContract(WETH_CONTRACT_ADDRESS ? WETH_CONTRACT_ADDRESS : ADDRESS_ZERO, wethABI, hasSigner)
}

export function useTreasuryContract(address: string, hasSigner?: boolean): Contract | null {
  return useContract(address, treasuryABI, hasSigner)
}

export function useVaultContract(hasSigner?: boolean): Contract | null {
  return useContract(VAULT_CONTRACT_ADDRESS ? VAULT_CONTRACT_ADDRESS : ADDRESS_ZERO, vaultABI, hasSigner)
}

export function useCpFarmContract(hasSigner?: boolean): Contract | null {
  return useContract(CPFARM_CONTRACT_ADDRESS ? CPFARM_CONTRACT_ADDRESS : ADDRESS_ZERO, cpFarmABI, hasSigner)
}

export function useLpFarmContract(hasSigner?: boolean): Contract | null {
  return useContract(LPFARM_CONTRACT_ADDRESS ? LPFARM_CONTRACT_ADDRESS : ADDRESS_ZERO, lpFarmABI, hasSigner)
}

export function useLpTokenContract(hasSigner?: boolean): Contract | null {
  return useContract(
    UNISWAP_LPTOKEN_CONTRACT_ADDRESS ? UNISWAP_LPTOKEN_CONTRACT_ADDRESS : ADDRESS_ZERO,
    lpTokenArtifact.abi,
    hasSigner
  )
}

export function useRegistryContract(hasSigner?: boolean): Contract | null {
  return useContract(REGISTRY_CONTRACT_ADDRESS ? REGISTRY_CONTRACT_ADDRESS : ADDRESS_ZERO, registryABI, hasSigner)
}

export function useCompoundProductContract(hasSigner?: boolean): Contract | null {
  return useContract(
    COMPOUND_PRODUCT_CONTRACT_ADDRESS ? COMPOUND_PRODUCT_CONTRACT_ADDRESS : ADDRESS_ZERO,
    compAbi,
    hasSigner
  )
}
