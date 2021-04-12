import { useMemo, useCallback } from 'react'
import { useVaultContract } from '../../../hooks/useContract'
import { Contract } from '@ethersproject/contracts'

export type VaultContract = {
  contract: Contract | null
  functions: {
    deposit: () => void
    withdraw: (shares: number, maxLoss: number) => number
    totalAssets: () => number
  }
}

export function useDeposit(): void {
  const contract = useVaultContract(true)

  if (!contract) {
    return
  }

  // put check here if wallet.isActive is true
  const response = contract?.deposit()
}

export function useWithdraw(shares: number, maxLoss: number): number {
  const contract = useVaultContract(true)
  if (!contract) {
    return 0
  }
  // put check here if wallet.isActive is true
  const response = contract?.withdraw(shares, maxLoss)
  return response
}

export function useTotalAssets(): number {
  const contract = useVaultContract(true)
  if (!contract) {
    return 0
  }
  const response = contract?.totalAssets()
  return response
}
