import { useMemo, useCallback } from 'react'
import { useMasterContract } from '../../../hooks/useContract'
import { Contract } from '@ethersproject/contracts'

import { useReload } from '../../../hooks/useReload'

import { useWallet } from '../../../context/Web3Manager'

export type MasterContract = {
  contract: Contract | null
  functions: {
    depositErc20: (farmId: number, amount: number) => Promise<void>
    withdrawErc20: (farmId: number, amount: number) => Promise<void>
    depositErc721: (farmId: number, token: number) => Promise<void>
    withdrawErc721: (farmId: number, token: number) => Promise<void>
    numFarms: () => Promise<number>
    pendingReward: (farmId: number, user: string) => Promise<number>
  }
}

export async function useDepositErc20(farmId: number, amount: number): Promise<void> {
  const contract = useMasterContract()
  // put check here if wallet.isActive is true
  if (!contract) {
    return
  }
  const response = await contract.deposit(farmId, amount)
  const result = response.wait()
}

export async function useWithdrawErc20(farmId: number, amount: number): Promise<void> {
  const contract = useMasterContract()
  if (!contract) {
    return
  }
  // put check here if wallet.isActive is true
  const response = await contract.withdraw(farmId, amount)
  const result = response.wait()
}

export async function useDepositErc721(farmId: number, token: number): Promise<void> {
  const contract = useMasterContract()
  if (!contract) {
    return
  }
  // put check here if wallet.isActive is true
  const response = await contract.deposit(farmId, token)
  const result = response.wait()
}

export async function useWithdrawErc721(farmId: number, token: number): Promise<void> {
  const contract = useMasterContract()
  if (!contract) {
    return
  }
  // put check here if wallet.isActive is true
  const response = await contract.withdraw(farmId, token)
  const result = response.wait()
}

export async function useNumFarms(): Promise<number> {
  const contract = useMasterContract()
  console.log('useNumFarms called')
  if (!contract) {
    return 0
  }
  const response = await contract.numFarms()
  const result = response.wait()
  return result
}

export async function usePendingReward(farmId: number, user: string): Promise<number> {
  const contract = useMasterContract()
  if (!contract) {
    return 0
  }
  // put check here if wallet.isActive is true
  const response = await contract.pendingReward(farmId, user)
  const result = response.wait()
  return result
}
