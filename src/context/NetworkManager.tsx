import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { NetworkConfig } from '../constants/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { MetamaskConnector } from '../wallet/wallet-connectors/MetaMask'

/* networks */
import { MainNetwork } from '../networks/mainnet'
import { KovanNetwork } from '../networks/kovan'
import { RinkebyNetwork } from '../networks/rinkeby'
import { PolygonNetwork } from '../networks/polygon'
import { MumbaiNetwork } from '../networks/mumbai'
import { AuroraNetwork } from '../networks/aurora'
import { AuroraTestnetNetwork } from '../networks/auroraTestnet'

/*

This manager keeps track of the current network and other important information.

*/

export const networks: NetworkConfig[] = [
  MainNetwork,
  RinkebyNetwork,
  KovanNetwork,
  // PolygonNetwork,
  // MumbaiNetwork,
  AuroraNetwork,
  AuroraTestnetNetwork,
]

type NetworkContext = {
  activeNetwork: NetworkConfig
  chainId: number
  currencyDecimals: number
  networks: NetworkConfig[]
  findNetworkByChainId: (chainId: number | undefined) => NetworkConfig | undefined
  findNetworkByName: (networkName: string) => NetworkConfig | undefined
  changeNetwork: (networkName: string, connector: AbstractConnector | undefined) => NetworkConfig | undefined
}

const NetworkContext = createContext<NetworkContext>({
  activeNetwork: networks[0],
  chainId: networks[0].chainId,
  currencyDecimals: networks[0].nativeCurrency.decimals,
  networks,
  findNetworkByChainId: () => undefined,
  findNetworkByName: () => undefined,
  changeNetwork: () => undefined,
})

const NetworksProvider: React.FC = (props) => {
  const [lastNetwork, setLastNetwork] = useLocalStorage<string | undefined>('solace_net')
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

  const findNetworkByName = useCallback((networkName: string): NetworkConfig | undefined => {
    return networks.find((n) => n.name.toLowerCase() === networkName.toLowerCase())
  }, [])

  const findNetworkByChainId = useCallback((chainId: number | undefined): NetworkConfig | undefined => {
    if (chainId == undefined) return undefined
    return networks.find((network) => network.chainId == chainId)
  }, [])

  const changeNetwork = useCallback((networkName: string, connector: AbstractConnector | undefined):
    | NetworkConfig
    | undefined => {
    const network = findNetworkByName(networkName)

    if (network) {
      setLastNetwork(network.name.toLowerCase())

      // there were cases where changing networks with the same wallet (not metamask) does not pull data correctly
      if (connector && !(connector instanceof MetamaskConnector)) window.location.reload()

      // there were cases where changing networks with the same wallet does not pull data correctly
      if (connector) window.location.reload() // <- uncomment if there's too many errors going on
    }

    return network
  }, [])

  const value = useMemo<NetworkContext>(
    () => ({
      activeNetwork,
      chainId: activeNetwork.chainId,
      currencyDecimals: activeNetwork?.nativeCurrency.decimals ?? networks[0].nativeCurrency.decimals,
      networks,
      findNetworkByChainId,
      findNetworkByName,
      changeNetwork,
    }),
    [activeNetwork, findNetworkByChainId, changeNetwork, findNetworkByName]
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
