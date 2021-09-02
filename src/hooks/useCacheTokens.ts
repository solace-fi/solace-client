import { useEffect, useRef, useState, useCallback } from 'react'
import { NetworkConfig, SupportedProduct, Token } from '../constants/types'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'
import { useSessionStorage } from 'react-use-storage'
import { NetworkCache } from '../constants/types'
import { ProductName } from '../constants/enums'

export const useCacheTokens = () => {
  const { library } = useWallet()
  const { activeNetwork, networks, findNetworkByChainId } = useNetwork()
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
      networks.forEach((network) => {
        const supportedProducts = network.cache.supportedProducts.map((product: SupportedProduct) => product.name)
        const cachedTokens: { [key: string]: { savedTokens: Token[]; tokensInitialized: boolean } } = {}
        const cachedPositions: { [key: string]: { positionNamesInitialized: boolean } } = {}
        supportedProducts.forEach((name: ProductName) => {
          cachedTokens[name] = { savedTokens: [], tokensInitialized: false }
          cachedPositions[name] = { positionNamesInitialized: false }
        })
        unsetTokenAndPositionData.push({
          name: network.name,
          chainId: network.chainId,
          tokens: cachedTokens,
          positions: cachedPositions,
        })
      })
      setStoredTokenAndPositionData(unsetTokenAndPositionData)
      return unsetTokenAndPositionData
    }
    return storedTokenAndPositionData
  }, [])

  const getAllTokensAndPositionsforChain = useCallback(
    async (data: NetworkCache[], _activeNetwork: NetworkConfig, _library: any) => {
      if (running.current || _library == undefined || _activeNetwork.chainId == undefined) return
      setDataInitialized(false)
      running.current = true
      if (!findNetworkByChainId(_activeNetwork.chainId)) {
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
        supportedProducts.map(async (supportedProduct: SupportedProduct) => {
          const productName = supportedProduct.name
          if (
            !newCache.tokens[productName].tokensInitialized &&
            !newCache.positions[productName].positionNamesInitialized
          ) {
            const tokens: Token[] = await supportedProduct.getTokens(_library, _activeNetwork)
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
        console.log('useCacheTokens: no token init needed')
      } else {
        const editedData = data.filter((data) => data.name != newCache.name)
        const newData = [...editedData, newCache]
        setStoredTokenAndPositionData(newData)
        console.log('useCacheTokens: token init completed')
      }
      setDataInitialized(true)
      running.current = false
    },
    []
  )

  useEffect(() => {
    const data = setStoredData()
    getAllTokensAndPositionsforChain(data, activeNetwork, library)
  }, [activeNetwork])

  return { dataInitialized, storedTokenAndPositionData }
}
