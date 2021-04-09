import { useMemo, useCallback } from 'react'
import { useVaultContract } from '../../../hooks/useContract'
import { Contract } from '@ethersproject/contracts'

import { useReload } from '../../../hooks/useReload'

import { useWallet } from '../../../context/Web3Manager'

export type VaultContract = {
  contract: Contract | null
  functions: {
    deposit: () => void
    withdraw: (shares: number, maxLoss: number) => Promise<number>
    totalAssets: () => Promise<number>
  }
}

export function useVault(): VaultContract {
  const contract = useVaultContract(undefined, undefined)
  const wallet = useWallet()

  async function deposit() {
    // put check here if wallet.isActive is true
    const response = await contract?.deposit()
    const result = await response.wait()
  }

  async function withdraw(shares: number, maxLoss: number): Promise<number> {
    // put check here if wallet.isActive is true
    const response = await contract?.withdraw(shares, maxLoss)
    const result = await response.wait()
    return result
  }

  async function totalAssets(): Promise<number> {
    const response = await contract?.totalAssets()
    const result = await response.wait()
    return result
  }

  return {
    contract,
    functions: {
      deposit,
      withdraw,
      totalAssets,
    },
  }
}
