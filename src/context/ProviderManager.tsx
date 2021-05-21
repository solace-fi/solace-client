import React, { useState, useEffect, useCallback } from 'react'
import { CHAIN_ID, ALCHEMY_API_KEY } from '../constants'
import { JsonRpcProvider, getDefaultProvider, Provider } from '@ethersproject/providers'

export function getNetworkName(chainId: number | undefined): string {
  switch (chainId) {
    case 1:
      return 'mainnet'
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
    case 5:
      return 'goerli'
    case 42:
      return 'kovan'
    default:
      return '-'
  }
}

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
      const fallbackprovider = getDefaultProvider(getNetworkName(Number(CHAIN_ID)), { alchemy: ALCHEMY_API_KEY })
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
