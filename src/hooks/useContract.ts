import { useWallet } from '../context/WalletManager'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'
import { contractConfig } from '../constants/chainConfig'
import { DEFAULT_CHAIN_ID } from '../constants'

export function useGetContract(address: string, abi: any, hasSigner = true): Contract | null {
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

export function useGetProductContracts(): { name: string; contract: Contract; signer: boolean }[] | null {
  const { library, account, chainId } = useWallet()
  const chainID = chainId ?? Number(DEFAULT_CHAIN_ID)
  const chainConfig = contractConfig[chainID] ?? contractConfig[Number(DEFAULT_CHAIN_ID)]

  return useMemo(() => {
    if (!library) return null
    for (let i = 0; i < chainConfig.supportedProducts.length; i++) {
      const signer = account ? true : false
      if (!chainConfig.supportedProducts[i].contract || signer !== chainConfig.supportedProducts[i].signer) {
        const contract = getContract(
          chainConfig.productContracts[chainConfig.supportedProducts[i].name].addr,
          chainConfig.productContracts[chainConfig.supportedProducts[i].name].abi,
          library,
          account ? account : undefined
        )
        chainConfig.supportedProducts[i] = { ...chainConfig.supportedProducts[i], contract: contract, signer: signer }
      }
    }
    return chainConfig.supportedProducts
  }, [library, account, chainId])
}
