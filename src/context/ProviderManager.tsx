import React, { useState, useEffect } from 'react'
import { CHAIN_ID, ALCHEMY_API_KEY } from '../constants'
import { Provider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { getNetworkName } from '../utils'

/*

This Manager initializes the Web3 provider and the JSON-RPC provider.

These two providers utilize the ethers library, which makes a strong distinction between
Providers and Signers. The Provider is a read-only abstraction to access blockchain data, while 
Signer is an abstraction that allows for executing state-changing operations.

Please refer to the Ethers documentation for more details.

The reason why two providers are employed at the moment is anchored on
whether the user connected their wallet. If they didn't, we use the JsonRpcProvider that taps into 
Alchemy to retrieve data, else, we use Web3Provider that can retrieve data, interact with the user's wallet, 
and write to the blockchain.

*/

export type ProviderContextType = {
  web3Provider?: Web3Provider
  ethProvider?: Provider
}

const InitialContextValue: ProviderContextType = {
  web3Provider: undefined,
  ethProvider: undefined,
}

const ProviderContext = React.createContext<ProviderContextType>(InitialContextValue)

// To get access to this Manager, import this into your component or hook
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

  // Runs only when component mounts for the first time
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
