import { useEffect, useRef, useState, useCallback } from 'react'
import { NetworkConfig, Token } from '../constants/types'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'
import { useSessionStorage } from 'react-use-storage'
import { NetworkCache } from '../constants/types'

export const useCacheTokens = () => {
  const { library } = useWallet()
  const { activeNetwork, chainId, networks, findNetworkByChainId } = useNetwork()
  const [storedTokenAndPositionData, setStoredTokenAndPositionData] = useSessionStorage<NetworkCache[]>(
    'sol_token_data',
    []
  )
  const running = useRef(false)
  const [dataInitialized, setDataInitialized] = useState<boolean>(false)

  const setStoredData = useCallback(() => {
    // on mount, if stored data exists in session already, return that data, else return newly made data
    if (storedTokenAndPositionData.length == 0) {
      const unsetTokenAndPositionData: NetworkCache[] = []
      networks.forEach((network) =>
        unsetTokenAndPositionData.push({
          name: network.name,
          chainId: network.chainId,
          tokens: network.cache.tokens,
          positions: network.cache.positions,
        })
      )
      setStoredTokenAndPositionData(unsetTokenAndPositionData)
      return unsetTokenAndPositionData
    }
    return storedTokenAndPositionData
  }, [])

  const getAllTokensAndPositionsforChain = useCallback(
    async (data: NetworkCache[], _activeNetwork: NetworkConfig, _chainId: number, _library: any) => {
      if (running.current || _library == undefined || _chainId == undefined) return
      setDataInitialized(false)
      running.current = true
      if (!findNetworkByChainId(_chainId)) {
        running.current = false
        return
      }

      // given the input data, find the dataset from that data appropriate to the current network
      const newCache = data.find((dataset) => dataset.name == _activeNetwork.name)
      if (!newCache) return
      const supportedProducts = _activeNetwork.cache.supportedProducts
      let changeOccurred = false

      // for every supported product in this network, initialize the tokens and positions
      await Promise.all(
        supportedProducts.map(async (supportedProduct: any) => {
          const productName = supportedProduct.name
          if (
            !newCache.tokens[productName].tokensInitialized &&
            !newCache.positions[productName].positionNamesInitialized
          ) {
            const tokens: Token[] = await _activeNetwork.config.functions.getTokens[productName](
              _library,
              _activeNetwork
            )
            const initializedTokens = {
              ...newCache.tokens[productName],
              savedTokens: tokens,
              tokensInitialized: true,
            }
            const positionNames = tokens.reduce(
              (names: any, token: any) => ({ ...names, [token.token.address.toLowerCase()]: token.underlying.symbol }),
              {}
            )
            const initializedPositions = {
              ...newCache.positions[productName],
              positionNames: positionNames,
              positionNamesInitialized: true,
            }
            newCache.tokens[productName] = initializedTokens
            newCache.positions[productName] = initializedPositions
            changeOccurred = true
          }
        })
      )
      if (!changeOccurred) {
      } else {
        const editedData = data.filter((data) => data.name != newCache.name)
        const newData = [...editedData, newCache]
        setStoredTokenAndPositionData(newData)
      }
      setDataInitialized(true)
      running.current = false
    },
    []
  )

  useEffect(() => {
    const data = setStoredData()
    getAllTokensAndPositionsforChain(data, activeNetwork, chainId, library)
  }, [activeNetwork])

  return { dataInitialized, storedTokenAndPositionData }
}
