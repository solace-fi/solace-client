import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { NetworkConfig } from '../constants/types'
import { KovanNetwork } from '../networks/kovan'
import { RinkebyNetwork } from '../networks/rinkeby'
import { useWallet } from './WalletManager'

const networks: NetworkConfig[] = [RinkebyNetwork, KovanNetwork]

type NetworkContext = {
  activeNetwork: NetworkConfig
  networks: NetworkConfig[]
  findNetworkByChainId: (chainId: number | undefined) => NetworkConfig | undefined
}

const NetworkContext = createContext<NetworkContext>({
  activeNetwork: networks[0],
  networks,
  findNetworkByChainId: () => undefined,
})

const NetworksProvider: React.FC = (props) => {
  const { chainId } = useWallet()

  const activeNetwork = useMemo(() => networks.find((network) => network.chainId == chainId), [chainId])

  const findNetworkByChainId = useCallback((chainId: number | undefined) => {
    if (chainId == undefined) return undefined
    return networks.find((network) => network.chainId == chainId)
  }, [])

  const value = useMemo<NetworkContext>(
    () => ({
      activeNetwork: activeNetwork ?? networks[0],
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
