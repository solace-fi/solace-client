import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { NetworkConfig } from '../constants/types'

/* networks */
import { MainNetwork } from '../networks/mainnet'
import { KovanNetwork } from '../networks/kovan'
import { RinkebyNetwork } from '../networks/rinkeby'
import { PolygonNetwork } from '../networks/polygon'
import { MumbaiNetwork } from '../networks/mumbai'
import { AuroraNetwork } from '../networks/aurora'
import { AuroraTestnetNetwork } from '../networks/auroraTestnet'
import { useWeb3React } from '@web3-react/core'
import { hexStripZeros } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

/*

This manager keeps track of the current network and other important information.

*/

export const networks: NetworkConfig[] = [
  MainNetwork,
  RinkebyNetwork,
  KovanNetwork,
  PolygonNetwork,
  MumbaiNetwork,
  AuroraNetwork,
  AuroraTestnetNetwork,
]

export const networksMapping = networks.reduce((configs: any, networkConfig: NetworkConfig) => ({
  ...configs,
  [networkConfig.chainId]: networkConfig,
}))

type NetworkContextType = {
  activeNetwork: NetworkConfig
  findNetworkByChainId: (chainId: number | undefined) => NetworkConfig | undefined
  changeNetwork: (targetChain: number) => void
}

const NetworkContext = createContext<NetworkContextType>({
  activeNetwork: networks[0],
  findNetworkByChainId: () => undefined,
  changeNetwork: () => undefined,
})

const NetworkManager: React.FC = (props) => {
  const { chainId, library } = useWeb3React()

  const findNetworkByChainId = useCallback((chainId: number | undefined): NetworkConfig | undefined => {
    if (chainId == undefined) return undefined
    return networks.find((network) => network.chainId == chainId)
  }, [])

  const activeNetwork = useMemo(() => {
    const netConfig = findNetworkByChainId(chainId)
    return netConfig ?? networks[0]
  }, [chainId, findNetworkByChainId])

  const changeNetwork = useCallback(
    async (targetChain: number) => {
      const switchToNetwork = async (targetChain: number) => {
        if (!library?.provider?.request) return

        const formattedChainId = hexStripZeros(BigNumber.from(targetChain).toHexString())
        try {
          await library.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: formattedChainId }],
          })
        } catch (error: any) {
          // 4902 is the error code for attempting to switch to an unrecognized chainId
          if (error.code === 4902) {
            const netConfig = findNetworkByChainId(targetChain)
            if (!netConfig) return

            await library.provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: formattedChainId,
                  chainName: netConfig.name,
                  rpcUrls: netConfig.rpc.httpsUrl,
                  nativeCurrency: netConfig.metamaskChain?.nativeCurrency,
                  blockExplorerUrls: [netConfig.explorer.url],
                },
              ],
            })
            // metamask (only known implementer) automatically switches after a network is added
            // the second call is done here because that behavior is not a part of the spec and cannot be relied upon in the future
            // metamask's behavior when switching to the current network is just to return null (a no-op)
            try {
              await library.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: formattedChainId }],
              })
            } catch (error) {
              console.debug('Added network but could not switch chains', error)
            }
          } else {
            throw error
          }
        }
      }

      switchToNetwork(targetChain).catch((error) => {
        console.error('Failed to switch network', error)
      })
    },
    [findNetworkByChainId, library]
  )

  const value = useMemo<NetworkContextType>(
    () => ({
      activeNetwork,
      findNetworkByChainId,
      changeNetwork,
    }),
    [activeNetwork, findNetworkByChainId, changeNetwork]
  )

  return <NetworkContext.Provider value={value}>{props.children}</NetworkContext.Provider>
}

export function useNetwork(): NetworkContextType {
  return useContext(NetworkContext)
}

export default NetworkManager
