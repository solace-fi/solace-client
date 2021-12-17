import { useEffect, useState, useCallback, useRef } from 'react'
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
import { useStorage } from '../hooks/useStorage'
import { NetworkCache } from '../constants/types'
import { PositionType } from '../constants/enums'
import { getTroveContract } from '../products/liquity/positionGetter/getPositions'
import { ZERO } from '../constants'
import { fetchTransferEventsOfUser } from '../utils/explorer'

export const useCachePositions = () => {
  const { library, account } = useWallet()
  const { activeNetwork } = useNetwork()
  const [storedPosData, setStoredPosData] = useStorage<NetworkCache[]>('session', 'sol_position_data', [])
  const [transferHistory, setTransferHistory] = useState<any>([])
  const [batchFetching, setBatchFetching] = useState<boolean>(false)
  const fetching = useRef<boolean>(false)

  // return initializedPositions and initializedPositionNames
  const handleInitPositions = useCallback(
    async (
      supportedProduct: SupportedProduct,
      newCache: NetworkCache
    ): Promise<{ initializedPositions: PositionsCacheValue; initializedPositionNames: PositionNamesCacheValue }> => {
      let _initializedPositions: PositionsCacheValue = {
        positions: [],
      }
      let _initializedPositionNames: PositionNamesCacheValue = {
        positionNames: {},
        underlyingPositionNames: {},
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
      const cachedPositions: PositionsCache = {}
      const cachedPositionNames: PositionNamesCache = {}
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
    async (supportedProducts: SupportedProduct[], reserved?: boolean): Promise<NetworkCache> => {
      const networkCache = initNetwork(activeNetwork)
      if (reserved) setBatchFetching(true)
      let changeOccurred = false
      await Promise.all(
        supportedProducts.map(async (supportedProduct) => {
          if (
            !networkCache.positionsCache[supportedProduct.name] &&
            !networkCache.positionNamesCache[supportedProduct.name]
          ) {
            console.log(`getCache: no position found for ${supportedProduct.name}, calling init`)
            const { initializedPositions, initializedPositionNames } = await handleInitPositions(
              supportedProduct,
              networkCache
            )
            networkCache.positionsCache[supportedProduct.name] = initializedPositions
            networkCache.positionNamesCache[supportedProduct.name] = initializedPositionNames
            changeOccurred = true
          }
        })
      )
      if (changeOccurred) {
        const editedData = storedPosData.filter((data) => data.chainId != networkCache.chainId)
        const newData = [...editedData, networkCache]
        setStoredPosData(newData)
        console.log(`getCache: change occurred, init completed`)
      } else {
        console.log(`getCache: no init needed`)
      }
      if (reserved) setBatchFetching(false)
      return networkCache
    },
    [activeNetwork, storedPosData, handleInitPositions, initNetwork, setStoredPosData]
  )

  const getCacheForPolicies = useCallback(
    async (supportedProducts: SupportedProduct[]): Promise<NetworkCache> => {
      return await getCache(supportedProducts, true)
    },
    [getCache]
  )

  const handleGetCache = useCallback(
    async (supportedProduct: SupportedProduct): Promise<NetworkCache | undefined> => {
      if (fetching.current || batchFetching) return undefined
      fetching.current = true
      const cache = await getCache([supportedProduct])
      fetching.current = false
      return cache
    },
    [batchFetching, getCache]
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

  return { batchFetching, storedPosData, handleGetCache, getCacheForPolicies }
}
