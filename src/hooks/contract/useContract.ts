import { useMemo } from 'react'
import { isAddress } from '../../utils'
import { Contract } from '@ethersproject/contracts'
import { ContractSources } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { AddressZero } from '@ethersproject/constants'

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

export function useContractArray(): ContractSources[] {
  const { activeNetwork } = useNetwork()

  return useMemo(() => {
    const config = activeNetwork.config
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
