import { useWallet } from '../context/WalletManager'
import { useMemo, useState } from 'react'
import { getContract } from '../utils'
import { Contract } from '@ethersproject/contracts'
import { contractConfig } from '../config/chainConfig'
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

export function useGetProductContracts(): { name: string; id: string; contract: Contract; signer: boolean }[] | null {
  const { library, account, chainId } = useWallet()
  const chainID = chainId ?? DEFAULT_CHAIN_ID
  const _contractConfig = contractConfig[String(chainID)] ?? contractConfig[String(DEFAULT_CHAIN_ID)]

  return useMemo(() => {
    if (!library) return null
    const signer = account ? true : false
    for (let i = 0; i < _contractConfig.supportedProducts.length; i++) {
      const id = _contractConfig.supportedProducts[i].id
      if (!_contractConfig.supportedProducts[i].contract || signer !== _contractConfig.supportedProducts[i].signer) {
        const contract = getContract(
          _contractConfig.productContracts[id].addr,
          _contractConfig.productContracts[id].abi,
          library,
          account ? account : undefined
        )
        _contractConfig.supportedProducts[i] = {
          ..._contractConfig.supportedProducts[i],
          contract: contract,
          signer: signer,
        }
      }
    }
    return _contractConfig.supportedProducts
  }, [library, account, chainId])
}

export function useContractArray(): { addr: string; abi: any }[] {
  const { chainId } = useWallet()
  const chainID = chainId ?? DEFAULT_CHAIN_ID
  const _contractConfig = contractConfig[String(chainID)] ?? contractConfig[String(DEFAULT_CHAIN_ID)]
  const [contractAddrs, setContractAddrs] = useState<{ addr: string; abi: any }[]>([])

  useMemo(() => {
    const arr: { addr: string; abi: any }[] = []
    Object.keys(_contractConfig.keyContracts).forEach((key) => {
      arr.push({
        addr: _contractConfig.keyContracts[key].addr.toLowerCase(),
        abi: _contractConfig.keyContracts[key].abi,
      })
    })
    Object.keys(_contractConfig.productContracts).forEach((key) => {
      arr.push({
        addr: _contractConfig.productContracts[key].addr.toLowerCase(),
        abi: _contractConfig.productContracts[key].abi,
      })
    })
    setContractAddrs(arr)
  }, [chainId])

  return contractAddrs
}
