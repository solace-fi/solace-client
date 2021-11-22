import { useWallet } from '../context/WalletManager'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'
import { BondTellerContract, ContractSources, ProductContract, SupportedProduct } from '../constants/types'
import { useNetwork } from '../context/NetworkManager'

import bondTellerErc20Abi from '../constants/abi/contracts/BondTellerErc20.sol/BondTellerErc20.json'
import bondTellerEthAbi from '../constants/abi/contracts/BondTellerEth.sol/BondTellerEth.json'

export function useGetContract(source: ContractSources | undefined, hasSigner = true): Contract | null {
  const { library, account } = useWallet()

  return useMemo(() => {
    if (!source || !library) return null
    if (!source.addr || !source.abi) return null
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

export function useGetBondTellerContracts(): BondTellerContract[] {
  const { library, account } = useWallet()
  const { activeNetwork } = useNetwork()

  return useMemo(() => {
    const config = activeNetwork.config
    const cache = activeNetwork.cache
    if (!library) return []
    const bondTellerContracts: BondTellerContract[] = []
    Object.keys(config.bondTellerContracts).forEach((key) => {
      const bondTellerContractAddr = config.bondTellerContracts[key]
      const isBondTellerErc20 = cache.tellerToTokenMapping[bondTellerContractAddr].isBondTellerErc20
      const isLp = cache.tellerToTokenMapping[bondTellerContractAddr].isLp
      const name = key
      const contract = getContract(
        bondTellerContractAddr,
        isBondTellerErc20 ? bondTellerErc20Abi : bondTellerEthAbi,
        library,
        account ? account : undefined
      )
      bondTellerContracts.push({
        name,
        contract,
        isBondTellerErc20,
        isLp,
      })
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
    Object.keys(config.bondTellerContracts).forEach((key) => {
      if (!excludedContractAddrs.includes(config.bondTellerContracts[key])) {
        const isBondTellerErc20 = cache.tellerToTokenMapping[config.bondTellerContracts[key]].isBondTellerErc20
        contractSources.push({
          addr: config.bondTellerContracts[key].toLowerCase(),
          abi: isBondTellerErc20 ? bondTellerErc20Abi : bondTellerEthAbi,
        })
      }
    })
    return contractSources
  }, [activeNetwork])
}
