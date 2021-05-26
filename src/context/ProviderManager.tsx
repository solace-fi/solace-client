import React, { useState, useEffect } from 'react'
import { CHAIN_ID, ALCHEMY_API_KEY, ETHERSCAN_API_KEY } from '../constants'
import { getDefaultProvider, Provider } from '@ethersproject/providers'
import { getNetworkName } from '../utils'

export type ProviderContextType = {
  ethProvider?: Provider
}

const InitialContextValue: ProviderContextType = {
  ethProvider: undefined,
}

const ProviderContext = React.createContext<ProviderContextType>(InitialContextValue)

export function useProvider(): ProviderContextType {
  return React.useContext(ProviderContext)
}

const ProviderManager: React.FC = ({ children }) => {
  const [ethProvider, setEthProvider] = useState<Provider>()

  useEffect(() => {
    const getProviders = async () => {
      const fallbackprovider = getDefaultProvider(getNetworkName(Number(CHAIN_ID)), {
        alchemy: ALCHEMY_API_KEY,
        etherscan: ETHERSCAN_API_KEY,
      })
      setEthProvider(fallbackprovider)
    }
    getProviders()
  }, [])

  const value = React.useMemo(
    () => ({
      ethProvider,
    }),
    [ethProvider]
  )
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>
}

export default ProviderManager
