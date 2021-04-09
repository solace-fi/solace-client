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
    numFarms: () => Promise<void>
    pendingReward: (farmId: number, user: string) => Promise<number>
  }
}

export function useMaster(): MasterContract {
  const contract = useMasterContract(undefined, undefined)
  const wallet = useWallet()

  async function depositErc20(farmId: number, amount: number): Promise<void> {
    // put check here if wallet.isActive is true
    const response = await contract?.deposit(farmId, amount)
    const result = await response.wait()
  }

  async function withdrawErc20(farmId: number, amount: number): Promise<void> {
    // put check here if wallet.isActive is true
    const response = await contract?.withdraw(farmId, amount)
    const result = await response.wait()
  }

  async function depositErc721(farmId: number, token: number): Promise<void> {
    // put check here if wallet.isActive is true
    const response = await contract?.deposit(farmId, token)
    const result = await response.wait()
  }

  async function withdrawErc721(farmId: number, token: number): Promise<void> {
    // put check here if wallet.isActive is true
    const response = await contract?.withdraw(farmId, token)
    const result = await response.wait()
  }

  async function numFarms(): Promise<void> {
    const response = await contract?.numFarms
    const result = await response.wait()
  }

  async function pendingReward(farmId: number, user: string): Promise<number> {
    // put check here if wallet.isActive is true
    const response = await contract?.pendingReward(farmId, user)
    const result = await response.wait()
    return result
  }

  return {
    contract,
    functions: {
      depositErc20,
      withdrawErc20,
      depositErc721,
      withdrawErc721,
      numFarms,
      pendingReward,
    },
  }
}
