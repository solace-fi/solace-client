import React, { useState, useEffect } from 'react'
import { CHAIN_ID, ALCHEMY_API_KEY } from '../constants'
import { Provider, JsonRpcProvider } from '@ethersproject/providers'
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
      const provider = new JsonRpcProvider(
        `https://eth-${getNetworkName(Number(CHAIN_ID))}.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
      )
      setEthProvider(provider)
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
