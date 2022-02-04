import { useWallet } from '../context/WalletManager'
import { useMemo } from 'react'
import { getContract, isAddress } from '../utils'
import { Contract } from '@ethersproject/contracts'
import { BondTellerContract, ContractSources, ProductContract, SupportedProduct } from '../constants/types'
import { useNetwork } from '../context/NetworkManager'

import bondTellerErc20Abi_V1 from '../constants/abi/contracts/BondTellerErc20.sol/BondTellerErc20.json'
import bondTellerErc20Abi_V2 from '../constants/metadata/BondTellerErc20_V2.json'
import bondTellerEthAbi_V1 from '../constants/abi/contracts/BondTellerEth.sol/BondTellerEth.json'
import bondTellerEthAbi_V2 from '../constants/metadata/BondTellerEth_V2.json'

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

export function useGetBondTellerContracts(): BondTellerContract[] {
  const { library, account } = useWallet()
  const { activeNetwork } = useNetwork()

  return useMemo(() => {
    const config = activeNetwork.config
    const cache = activeNetwork.cache
    if (!library) return []
    const bondTellerContracts: BondTellerContract[] = []
    Object.keys(config.bondTellerContracts).forEach((key) => {
      const versionsArray = config.bondTellerContracts[key]
      versionsArray.forEach((bondTellerContract) => {
        const mapping = cache.tellerToTokenMapping[bondTellerContract]
        const isBondTellerErc20 = mapping.isBondTellerErc20
        const isLp = mapping.isLp
        const isDisabled = mapping.isDisabled
        const cannotBuy = mapping.cannotBuy
        const addr = mapping.addr
        const mainnetAddr = mapping.mainnetAddr
        const tokenId = mapping.tokenId
        const version = mapping.version
        const tellerAbi = mapping.tellerAbi
        const principalAbi = mapping.principalAbi
        const contract = getContract(bondTellerContract, tellerAbi, library, account ? account : undefined)
        const cntct: BondTellerContract = {
          name: key,
          contract,
          tellerAbi,
          principalAbi,
          isBondTellerErc20,
          isLp,
          addr,
          mainnetAddr,
          tokenId,
          version,
          isDisabled,
          cannotBuy,
        }
        bondTellerContracts.push(cntct)
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
      const versionsArray = config.bondTellerContracts[key]
      versionsArray.forEach((bondTellerContract) => {
        if (!excludedContractAddrs.includes(bondTellerContract)) {
          const abi = cache.tellerToTokenMapping[bondTellerContract].tellerAbi
          contractSources.push({
            addr: bondTellerContract.toLowerCase(),
            abi,
          })
        }
      })
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
