import { useWallet } from '../context/WalletManager'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'
import { contractConfig } from '../utils/config/chainConfig'
import { ContractSources, SupportedProduct } from '../constants/types'

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

export function useGetProductContracts(): SupportedProduct[] {
  const { library, account, chainId } = useWallet()

  return useMemo(() => {
    const config = contractConfig[String(chainId)]
    if (!library) return []
    const signer = account ? true : false
    config.supportedProducts.map((product: SupportedProduct, i: number) => {
      const name = product.name
      if (!product.contract || signer !== product.signer) {
        const productContractSources = config.productContracts[name]
        const contract = getContract(
          productContractSources.addr,
          productContractSources.abi,
          library,
          account ? account : undefined
        )
        config.supportedProducts[i] = {
          ...product,
          contract: contract,
          signer: signer,
        }
      }
    })
    return config.supportedProducts
  }, [library, account, chainId])
}

export function useContractArray(): ContractSources[] {
  const { chainId } = useWallet()

  return useMemo(() => {
    const config = contractConfig[String(chainId)]
    const contractSources: ContractSources[] = []
    Object.keys(config.keyContracts).forEach((key) => {
      contractSources.push({
        addr: config.keyContracts[key].addr.toLowerCase(),
        abi: config.keyContracts[key].abi,
      })
    })
    Object.keys(config.productContracts).forEach((key) => {
      contractSources.push({
        addr: config.productContracts[key].addr.toLowerCase(),
        abi: config.productContracts[key].abi,
      })
    })
    return contractSources
  }, [chainId])
}
