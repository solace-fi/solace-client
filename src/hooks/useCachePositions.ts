import { useEffect, useRef, useState, useCallback } from 'react'
import {
  LiquityPosition,
  NetworkConfig,
  Position,
  PositionNamesCache,
  PositionNamesCacheValue,
  PositionsCache,
  PositionsCacheValue,
  SupportedProduct,
  Token,
} from '../constants/types'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'
import { useSessionStorage } from 'react-use-storage'
import { NetworkCache } from '../constants/types'
import { PositionType, ProductName } from '../constants/enums'
import { getTroveContract } from '../products/liquity/positionGetter/getPositions'
import { ZERO } from '../constants'
import { fetchTransferEventsOfUser } from '../utils/explorer'

export const useCachePositions = () => {
  const { library, account } = useWallet()
  const { activeNetwork } = useNetwork()
  const [storedPosData, setStoredPosData] = useSessionStorage<NetworkCache[]>('sol_position_data', [])
  const [transferHistory, setTransferHistory] = useState<any>([])
  const [batchFetching, setBatchFetching] = useState<boolean>(false)
  const [fetching, setFetching] = useState<boolean>(false)

  // return initializedPositions and initializedPositionNames
  const handleInitPositions = useCallback(
    async (
      supportedProduct: SupportedProduct,
      newCache: NetworkCache
    ): Promise<{ initializedPositions: PositionsCacheValue; initializedPositionNames: PositionNamesCacheValue }> => {
      let _initializedPositions: PositionsCacheValue = {
        positions: [],
        init: false,
      }
      let _initializedPositionNames: PositionNamesCacheValue = {
        positionNames: {},
        underlyingPositionNames: {},
        init: false,
      }
      switch (supportedProduct.positionsType) {
        case PositionType.TOKEN:
          if (typeof supportedProduct.getTokens !== 'undefined') {
            const tokens: Token[] = await supportedProduct.getTokens[activeNetwork.chainId](library, activeNetwork, {
              user: account,
              transferHistory,
            }).catch((err) => {
              console.log(`useCachePositions: getTokens() for ${supportedProduct.name} product failed`, err)
              return []
            })
            _initializedPositions = {
              ...newCache.positionsCache[supportedProduct.name],
              positions: tokens.map((token) => {
                return { type: PositionType.TOKEN, position: token }
              }) as Position[],
              init: true,
            }
            _initializedPositionNames = {
              positionNames: tokens.reduce(
                (names: any, token: Token) => ({
                  ...names,
                  [token.token.address.toLowerCase()]: token.token.symbol,
                }),
                {}
              ),
              underlyingPositionNames: tokens.reduce(
                (names: any, token: Token) => ({
                  ...names,
                  [token.token.address.toLowerCase()]: token.underlying.map(
                    (underlyingToken) => underlyingToken.symbol
                  ),
                }),
                {}
              ),
              init: true,
            }
            break
          } else break
        case PositionType.LQTY:
          const troveManagerContract = getTroveContract(library, activeNetwork.chainId)
          const stabilityPoolAddr = await troveManagerContract.stabilityPool().catch((e: any) => {
            console.log(`useCachePositions: troveManagerContract.stabilityPool() failed`, e)
            return ''
          })
          const lqtyStakingAddr = await troveManagerContract.lqtyStaking().catch((e: any) => {
            console.log(`useCachePositions: troveManagerContract.lqtyStaking() failed`, e)
            return ''
          })
          const lusdTokenAddr = await troveManagerContract.lusdToken().catch((e: any) => {
            console.log(`useCachePositions: troveManagerContract.lusdToken() failed`, e)
            return ''
          })
          const lqtyTokenAddr = await troveManagerContract.lqtyToken().catch((e: any) => {
            console.log(`useCachePositions: troveManagerContract.lqtyToken() failed`, e)
            return ''
          })
          const liquityPositions: LiquityPosition[] = []
          if (troveManagerContract.address) {
            liquityPositions.push({
              positionAddress: troveManagerContract.address.toLowerCase(),
              positionName: 'Trove',
              amount: ZERO,
              nativeAmount: ZERO,
              associatedToken: {
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                name: 'Ether',
                symbol: 'ETH',
              },
            })
          }
          if (stabilityPoolAddr && lusdTokenAddr) {
            liquityPositions.push({
              positionAddress: stabilityPoolAddr.toLowerCase(),
              positionName: 'Stability Pool',
              amount: ZERO,
              nativeAmount: ZERO,
              associatedToken: { address: lusdTokenAddr, name: 'LUSD', symbol: 'LUSD' },
            })
          }
          if (lqtyStakingAddr && lqtyTokenAddr) {
            liquityPositions.push({
              positionAddress: lqtyStakingAddr.toLowerCase(),
              positionName: 'Staking Pool',
              amount: ZERO,
              nativeAmount: ZERO,
              associatedToken: { address: lqtyTokenAddr, name: 'LQTY', symbol: 'LQTY' },
            })
          }
          _initializedPositions = {
            ...newCache.positionsCache[supportedProduct.name],
            positions: liquityPositions.map((liquityPos) => {
              return { type: PositionType.LQTY, position: liquityPos }
            }) as Position[],
            init: true,
          }
          _initializedPositionNames = {
            positionNames: liquityPositions.reduce(
              (names: any, liquityPos: LiquityPosition) => ({
                ...names,
                [liquityPos.positionAddress.toLowerCase()]: liquityPos.positionName,
              }),
              {}
            ),
            underlyingPositionNames: liquityPositions.reduce(
              (names: any, liquityPos: LiquityPosition) => ({
                ...names,
                [liquityPos.positionAddress.toLowerCase()]: [liquityPos.associatedToken.name],
              }),
              {}
            ),
            init: true,
          }
          break
        case PositionType.OTHER:
        default:
      }
      const initializedPositions: PositionsCacheValue = _initializedPositions
      const initializedPositionNames: PositionNamesCacheValue = _initializedPositionNames
      return { initializedPositions, initializedPositionNames }
    },
    [activeNetwork, library, account, transferHistory]
  )

  // returns the networkCache if it exists, return a newly created one otherwise
  const initNetwork = useCallback(
    (network: NetworkConfig): NetworkCache => {
      // if a network cache with this network id exists already, do not init network again
      const existingNetworkCache = storedPosData.find((data) => data.chainId == network.chainId)
      if (existingNetworkCache) return existingNetworkCache
      const supportedProducts = network.cache.supportedProducts.map((product: SupportedProduct) => product.name)
      const cachedPositions: PositionsCache = {}
      const cachedPositionNames: PositionNamesCache = {}
      supportedProducts.forEach((name: ProductName) => {
        cachedPositions[name] = { positions: [], init: false }
        cachedPositionNames[name] = { positionNames: {}, underlyingPositionNames: {}, init: false }
      })
      const networkCache: NetworkCache = {
        chainId: network.chainId,
        positionsCache: cachedPositions,
        positionNamesCache: cachedPositionNames,
      }
      setStoredPosData([networkCache, ...storedPosData])
      return networkCache
    },
    [storedPosData, setStoredPosData]
  )

  const getCache = useCallback(
    async (supportedProduct: SupportedProduct): Promise<NetworkCache> => {
      const networkCache = initNetwork(activeNetwork)
      if (
        !networkCache.positionsCache[supportedProduct.name].init &&
        !networkCache.positionNamesCache[supportedProduct.name].init
      ) {
        console.log(`getCache: no position found for ${supportedProduct.name}, calling init`)
        const { initializedPositions, initializedPositionNames } = await handleInitPositions(
          supportedProduct,
          networkCache
        )
        networkCache.positionsCache[supportedProduct.name] = initializedPositions
        networkCache.positionNamesCache[supportedProduct.name] = initializedPositionNames
        const editedData = storedPosData.filter((data) => data.chainId != networkCache.chainId)
        const newData = [...editedData, networkCache]
        setStoredPosData(newData)
        console.log(`getCache: position init completed for ${supportedProduct.name}`)
      } else {
        console.log(`getCache: no position init needed for ${supportedProduct.name}`)
      }
      return networkCache
    },
    [activeNetwork, storedPosData, handleInitPositions, initNetwork, setStoredPosData]
  )

  const getCacheForPolicies = useCallback(
    async (supportedProducts: SupportedProduct[]): Promise<NetworkCache> => {
      const networkCache = initNetwork(activeNetwork)
      setBatchFetching(true)
      await Promise.all(
        supportedProducts.map(async (product) => {
          if (!networkCache.positionsCache[product.name].init && !networkCache.positionNamesCache[product.name].init) {
            const { initializedPositions, initializedPositionNames } = await handleInitPositions(product, networkCache)
            networkCache.positionsCache[product.name] = initializedPositions
            networkCache.positionNamesCache[product.name] = initializedPositionNames
          }
        })
      )
      const editedData = storedPosData.filter((data) => data.chainId != networkCache.chainId)
      const newData = [...editedData, networkCache]
      setStoredPosData(newData)
      setBatchFetching(false)
      return networkCache
    },
    [activeNetwork, handleInitPositions, initNetwork, setStoredPosData, storedPosData]
  )

  /* 
    This function should be called by policy-related functions, and the balance-getter functions. If this function is being called
    by policy-related functions, balance-getter functions cannot successfully call the function.
  */
  const handleGetCache = useCallback(
    async (supportedProduct: SupportedProduct): Promise<NetworkCache | undefined> => {
      if (fetching || batchFetching) return undefined
      setFetching(true)
      const cache = await getCache(supportedProduct)
      setFetching(false)
      return cache
    },
    [fetching, batchFetching, getCache]
  )

  useEffect(() => {
    const getTransfers = async () => {
      if (!account) {
        console.log('useCachePositions: no account found, no init needed yet')
        return
      }
      const transferHistory = await fetchTransferEventsOfUser(activeNetwork.explorer.apiUrl, account)
      setTransferHistory(transferHistory)
    }
    getTransfers()
  }, [account, activeNetwork.explorer.apiUrl])

  return { batchFetching, fetching, storedPosData, handleGetCache, getCacheForPolicies }
}
