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
  const running = useRef(false)
  const [dataInitialized, setDataInitialized] = useState<boolean>(false)

  // return initializedPositions and initializedPositionNames
  const handleInitPositions = async (
    supportedProduct: SupportedProduct,
    newCache: NetworkCache,
    _library: any,
    _activeNetwork: NetworkConfig,
    metadata?: any
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
          const tokens: Token[] = await supportedProduct.getTokens[_activeNetwork.chainId](
            _library,
            _activeNetwork,
            metadata
          ).catch((err) => {
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
                [token.token.address.toLowerCase()]: token.underlying.map((underlyingToken) => underlyingToken.symbol),
              }),
              {}
            ),
            init: true,
          }
          break
        } else break
      case PositionType.LQTY:
        const troveManagerContract = getTroveContract(library, _activeNetwork.chainId)
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
  }

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
    [storedPosData, account, activeNetwork.explorer.apiUrl]
  )

  // returns the networkCache if its positions and names are initialized, return it with them being initialized otherwise
  const getCache = useCallback(
    async (supportedProducts: SupportedProduct[]): Promise<NetworkCache> => {
      let changeOccurred = false
      const networkCache = initNetwork(activeNetwork)
      if (running.current) return networkCache
      setDataInitialized(false)
      running.current = true
      await Promise.all(
        supportedProducts.map(async (supportedProduct: SupportedProduct) => {
          if (
            !networkCache.positionsCache[supportedProduct.name].init &&
            !networkCache.positionNamesCache[supportedProduct.name].init
          ) {
            const { initializedPositions, initializedPositionNames } = await handleInitPositions(
              supportedProduct,
              networkCache,
              library,
              activeNetwork,
              { user: account, transferHistory }
            )
            networkCache.positionsCache[supportedProduct.name] = initializedPositions
            networkCache.positionNamesCache[supportedProduct.name] = initializedPositionNames
            changeOccurred = true
          }
        })
      )

      if (!changeOccurred) {
        console.log('useCachePositions2: no position init needed')
      } else {
        const editedData = storedPosData.filter((data) => data.chainId != networkCache.chainId)
        const newData = [...editedData, networkCache]
        setStoredPosData(newData)
        console.log('useCachePositions2: position init completed')
      }
      running.current = false
      setDataInitialized(true)
      return networkCache
    },
    [account, activeNetwork, library, storedPosData, transferHistory]
  )

  useEffect(() => {
    const getTransfers = async () => {
      if (!account) {
        console.log('useCachePositions2: no account found, no init needed yet')
        return
      }
      const transferHistory = await fetchTransferEventsOfUser(activeNetwork.explorer.apiUrl, account)
      setTransferHistory(transferHistory)
    }
    getTransfers()
  }, [account, activeNetwork.explorer.apiUrl])

  return { dataInitialized, storedPosData, getCache }
}
