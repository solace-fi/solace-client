import { useMemo } from 'react'
import { isAddress } from '../../utils'
import { Contract } from '@ethersproject/contracts'
import { ContractSources, TellerTokenMetadata } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { AddressZero } from '@ethersproject/constants'
import { BondTellerContractData } from '@solace-fi/sdk-nightly'

export function useGetContract(source: ContractSources | undefined, hasSigner = true): Contract | null {
  const { provider, signer } = useProvider()

  return useMemo(() => {
    if (!source) return null
    if (!source.addr || !isAddress(source.addr) || !source.abi) return null
    try {
      if (!isAddress(source.addr) || source.addr === AddressZero) {
        throw Error(`Invalid 'address' parameter '${source.addr}'.`)
      }

      if (source.abi == null || source.abi == undefined) {
        throw Error(`ABI parameter invalid: ${source.abi}`)
      }

      const contract = new Contract(source.addr, source.abi, hasSigner ? signer ?? provider : provider)
      return contract
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [source, hasSigner, provider, signer])
}

export function useGetBondTellerContracts(): (BondTellerContractData & {
  metadata: TellerTokenMetadata
})[] {
  const { activeNetwork } = useNetwork()
  const { provider, signer } = useProvider()
  return useMemo(() => {
    const cache = activeNetwork.cache
    if (!cache) return []
    const bondTellerContracts: (BondTellerContractData & { metadata: TellerTokenMetadata })[] = []
    Object.keys(cache.tellerToTokenMapping).forEach((key) => {
      const mapping = cache.tellerToTokenMapping[key]
      const tellerAbi = mapping.tellerAbi
      const contract = new Contract(key, tellerAbi, signer ?? provider)
      const type = mapping.isBondTellerErc20
        ? 'erc20'
        : mapping.name == 'ETH'
        ? 'eth'
        : mapping.name == 'FTM'
        ? 'ftm'
        : 'matic'
      const cntct: BondTellerContractData & { metadata: TellerTokenMetadata } = {
        contract,
        type,
        metadata: mapping,
      }
      bondTellerContracts.push(cntct)
    })
    return bondTellerContracts
  }, [provider, signer, activeNetwork])
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
