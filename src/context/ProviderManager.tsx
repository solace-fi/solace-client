import React, { useState, useEffect, useCallback } from 'react'
import { CHAIN_ID, ALCHEMY_API_KEY } from '../constants'
import { JsonRpcProvider, Web3Provider, getDefaultProvider, Provider } from '@ethersproject/providers'
import { useReload } from '../hooks/useReload'

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
  networkName?: string
  ethProvider?: Provider
  web3Provider?: Provider
}

const InitialContextValue: ProviderContextType = {
  networkName: undefined,
  ethProvider: undefined,
  web3Provider: undefined,
}

const ProviderContext = React.createContext<ProviderContextType>(InitialContextValue)

export function useProvider(): ProviderContextType {
  return React.useContext(ProviderContext)
}

const ProviderManager: React.FC = ({ children }) => {
  const [ethProvider, setEthProvider] = useState<Provider>()
  const [web3Provider, setWeb3Provider] = useState<Provider>()
  const _window = window as any

  const getWeb3 = async () => {
    if (_window.ethereum) {
      await _window.ethereum.send('eth_requestAccounts')
      const provider = new Web3Provider(_window.ethereum)
      return provider
    }
  }

  useEffect(() => {
    const getProviders = async () => {
      const provider = new JsonRpcProvider(
        `https://eth-${getNetworkName(Number(CHAIN_ID))}.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
      )
      const fallbackprovider = getDefaultProvider(getNetworkName(Number(CHAIN_ID)), { alchemy: ALCHEMY_API_KEY })
      const web3Provider = await getWeb3()
      setEthProvider(fallbackprovider)
      setWeb3Provider(web3Provider)
    }
    getProviders()
  }, [_window.ethereum])

  const value = React.useMemo(
    () => ({
      getNetworkName: getNetworkName(Number(CHAIN_ID)),
      ethProvider,
      web3Provider,
    }),
    [web3Provider, ethProvider]
  )
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>
}

export default ProviderManager
