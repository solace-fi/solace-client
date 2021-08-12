import React, { useState, useEffect } from 'react'
import { ALCHEMY_API_KEY } from '../constants'
import { Provider, JsonRpcProvider } from '@ethersproject/providers'
import { useNetwork } from './NetworkManager'
// import { getTokens } from '../utils/positionGetters/yearn/getTokens'

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

type ProviderContextType = {
  ethProvider?: Provider
}

const InitialContextValue: ProviderContextType = {
  ethProvider: undefined,
}

const ProviderContext = React.createContext<ProviderContextType>(InitialContextValue)

// To get access to this Manager, import this into your component or hook
export function useProvider(): ProviderContextType {
  return React.useContext(ProviderContext)
}

const ProviderManager: React.FC = ({ children }) => {
  const [ethProvider, setEthProvider] = useState<Provider>()
  const { activeNetwork } = useNetwork()

  const getProvider = async () => {
    const provider = new JsonRpcProvider(`https://eth-${activeNetwork.name}.alchemyapi.io/v2/${ALCHEMY_API_KEY}`)
    setEthProvider(provider)
  }

  useEffect(() => {
    getProvider()
  }, [activeNetwork])

  const value = React.useMemo(
    () => ({
      ethProvider,
    }),
    [ethProvider]
  )
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>
}

export default ProviderManager
