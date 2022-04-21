import { useWallet } from '../../context/WalletManager'
import { useMemo } from 'react'
import { getContract, isAddress } from '../../utils'
import { Contract } from '@ethersproject/contracts'
import {
  BondTellerContractData,
  ContractSources,
  ProductContract,
  SupportedProduct,
  TellerTokenMetadata,
} from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'

export function useGetContract(source: ContractSources | undefined, hasSigner = true): Contract | null {
  const { library, account } = useWallet()

  return useMemo(() => {
    if (!source || !library) return null
    if (!source.addr || !isAddress(source.addr) || !source.abi) return null
    try {
      const contract = getContract(source.addr, source.abi, library, hasSigner && account ? account : undefined)
      return contract
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [source, library, hasSigner, account])
}

export function useGetProductContracts(): ProductContract[] {
  const { library, account } = useWallet()
  const { activeNetwork } = useNetwork()

  return useMemo(() => {
    const config = activeNetwork.config
    const cache = activeNetwork.cache
    if (!library || !cache) return []
    const productContracts: ProductContract[] = []
    cache.supportedProducts.map((product: SupportedProduct) => {
      const name = product.name
      const productContractSources = config.productContracts[name]
      const contract = getContract(
        productContractSources.addr,
        productContractSources.abi,
        library,
        account ? account : undefined
      )
      productContracts.push({
        name,
        contract,
      })
    })
    return productContracts
  }, [library, account, activeNetwork])
}

export function useGetBondTellerContracts(): (BondTellerContractData & { metadata: TellerTokenMetadata })[] {
  const { library, account } = useWallet()
  const { activeNetwork } = useNetwork()

  return useMemo(() => {
    const cache = activeNetwork.cache
    if (!library) return []
    const bondTellerContracts: (BondTellerContractData & { metadata: TellerTokenMetadata })[] = []
    Object.keys(cache.tellerToTokenMapping).forEach((key) => {
      const mapping = cache.tellerToTokenMapping[key]
      const tellerAbi = mapping.tellerAbi
      const contract = getContract(key, tellerAbi, library, account ? account : undefined)
      const type = mapping.isBondTellerErc20 ? 'erc20' : mapping.name == 'ETH' ? 'eth' : 'matic'
      const cntct: BondTellerContractData & { metadata: TellerTokenMetadata } = {
        contract,
        type,
        metadata: mapping,
      }
      bondTellerContracts.push(cntct)
    })
    return bondTellerContracts
  }, [library, account, activeNetwork])
}

export function useContractArray(): ContractSources[] {
  const { activeNetwork } = useNetwork()

  return useMemo(() => {
    const config = activeNetwork.config
    const cache = activeNetwork.cache
    const contractSources: ContractSources[] = []
    const excludedContractAddrs = activeNetwork.explorer.excludedContractAddrs

    Object.keys(config.keyContracts).forEach((key) => {
      if (!excludedContractAddrs.includes(config.keyContracts[key].addr)) {
        contractSources.push({
          addr: config.keyContracts[key].addr.toLowerCase(),
          abi: config.keyContracts[key].abi,
        })
      }
    })
    Object.keys(config.productContracts).forEach((key) => {
      if (!excludedContractAddrs.includes(config.productContracts[key].addr)) {
        contractSources.push({
          addr: config.productContracts[key].addr.toLowerCase(),
          abi: config.productContracts[key].abi,
        })
      }
    })
    Object.keys(cache.tellerToTokenMapping).forEach((key) => {
      if (!excludedContractAddrs.includes(key)) {
        const abi = cache.tellerToTokenMapping[key].tellerAbi
        contractSources.push({
          addr: key.toLowerCase(),
          abi,
        })
      }
    })
    Object.keys(config.specialContracts).forEach((key) => {
      if (!excludedContractAddrs.includes(config.specialContracts[key].addr)) {
        contractSources.push({
          addr: config.specialContracts[key].addr.toLowerCase(),
          abi: config.specialContracts[key].abi,
        })
      }
    })
    return contractSources
  }, [activeNetwork])
}
