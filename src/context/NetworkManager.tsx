import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { useSessionStorage } from 'react-use-storage'
import { NetworkConfig } from '../constants/types'
import { KovanNetwork } from '../networks/kovan'
import { RinkebyNetwork } from '../networks/rinkeby'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { MetamaskConnector } from '../wallet/wallets/MetaMask'
import { useWallet } from './WalletManager'

const networks: NetworkConfig[] = [RinkebyNetwork, KovanNetwork]

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

      // there were cases where changing networks without changing the wallet does not give the accurate balance in that network
      if (connector && !(connector instanceof MetamaskConnector)) window.location.reload()
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
