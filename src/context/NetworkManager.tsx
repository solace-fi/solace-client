import React, { createContext, useCallback, useContext, useMemo, useEffect } from 'react'
import { useSessionStorage } from 'react-use-storage'
import { NetworkConfig } from '../constants/types'
import { KovanNetwork } from '../networks/kovan'
import { RinkebyNetwork } from '../networks/rinkeby'
import { useCachedData } from './CachedDataManager'
import { useWallet } from './WalletManager'

const networks: NetworkConfig[] = [RinkebyNetwork, KovanNetwork]

type NetworkContext = {
  activeNetwork: NetworkConfig
  chainId: number
  currencyDecimals: number
  networks: NetworkConfig[]
  findNetworkByChainId: (chainId: number | undefined) => NetworkConfig | undefined
}

const NetworkContext = createContext<NetworkContext>({
  activeNetwork: networks[0],
  chainId: networks[0].chainId,
  currencyDecimals: networks[0].nativeCurrency.decimals,
  networks,
  findNetworkByChainId: () => undefined,
})

const NetworksProvider: React.FC = (props) => {
  const { connector } = useWallet()
  const { reload } = useCachedData()
  const [lastNetwork, setLastNetwork] = useSessionStorage<string | undefined>('solace_net')

  const activeNetwork = useMemo(() => {
    let network: NetworkConfig | undefined

    try {
      if (lastNetwork) {
        const networkName = lastNetwork?.toLowerCase()
        network = networks.find((n) => n.name.toLowerCase() === networkName)
      }
    } catch {}
    return network ?? networks[0]
  }, [lastNetwork])

  const findNetworkByName = useCallback((networkName: string) => {
    return networks.find((n) => n.name.toLowerCase() === networkName.toLowerCase())
  }, [])

  const findNetworkByChainId = useCallback((chainId: number | undefined) => {
    if (chainId == undefined) return undefined
    return networks.find((network) => network.chainId == chainId)
  }, [])

  const changeNetwork = useCallback(
    (networkName: string): NetworkConfig | undefined => {
      const network = findNetworkByName(networkName)

      if (network) {
        setLastNetwork(network.name.toLowerCase())
        reload()
      }

      return network
    },
    [findNetworkByName, reload, setLastNetwork]
  )

  useEffect(() => {
    if (connector && connector.id == 'metamask') {
      connector
        .getConnector()
        .getProvider()
        .then((provider) => {
          provider.on('chainChanged', (chainId: number) => {
            const network = findNetworkByChainId(Number(chainId)) ?? networks[0]
            changeNetwork(network.name)
          })
        })
    }
  }, [connector, changeNetwork, findNetworkByChainId])

  // const switchNetwork = useCallback(
  //   async (networkName: string) => {
  //     const network = findNetworkByName(networkName)

  //     if (!network) {
  //       return
  //     }

  //     let canSetNetwork = true

  //     if (connector && connector.id == 'metamask') {
  //       try {
  //         const error = await connector.switchChain({
  //           chainId: network.chainId,
  //         })

  //         if (error) {
  //           canSetNetwork = false
  //         }
  //       } catch (e) {
  //         canSetNetwork = false

  //         // @ts-ignore
  //         if (e.code === 4902) {
  //           await connector.addChain(network.metamaskChain)
  //         }
  //       }
  //     }

  //     if (canSetNetwork) {
  //       changeNetwork(network.id)
  //     }
  //   },
  //   [connector]
  // )

  const value = useMemo<NetworkContext>(
    () => ({
      activeNetwork,
      chainId: activeNetwork.chainId,
      currencyDecimals: activeNetwork?.nativeCurrency.decimals ?? networks[0].nativeCurrency.decimals,
      networks,
      findNetworkByChainId,
    }),
    [activeNetwork, findNetworkByChainId]
  )

  return <NetworkContext.Provider value={value}>{props.children}</NetworkContext.Provider>
}

// To get access to this Manager, import this into your component or hook
export function useNetwork(): NetworkContext {
  return useContext(NetworkContext)
}

const NetworkManager: React.FC = (props) => {
  return <NetworksProvider>{props.children}</NetworksProvider>
}

export default NetworkManager
