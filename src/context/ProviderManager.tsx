import React, { useState, useEffect } from 'react'
import { CHAIN_ID, ALCHEMY_API_KEY } from '../constants'
import { Provider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { getNetworkName } from '../utils'

export type ProviderContextType = {
  web3Provider?: Web3Provider
  ethProvider?: Provider
}

const InitialContextValue: ProviderContextType = {
  web3Provider: undefined,
  ethProvider: undefined,
}

const ProviderContext = React.createContext<ProviderContextType>(InitialContextValue)

export function useProvider(): ProviderContextType {
  return React.useContext(ProviderContext)
}

const ProviderManager: React.FC = ({ children }) => {
  const [ethProvider, setEthProvider] = useState<Provider>()
  const [web3Provider, setWeb3Provider] = useState<Web3Provider>()

  const _window = window as any

  const getProviders = async () => {
    const provider = new JsonRpcProvider(
      `https://eth-${getNetworkName(Number(CHAIN_ID))}.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
    )
    if (_window.ethereum) {
      const web3 = new Web3Provider(_window.ethereum, 'any')
      setWeb3Provider(web3)
    }
    setEthProvider(provider)
  }

  useEffect(() => {
    getProviders()
  }, [])

  const value = React.useMemo(
    () => ({
      web3Provider,
      ethProvider,
    }),
    [web3Provider, ethProvider]
  )
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>
}

export default ProviderManager
