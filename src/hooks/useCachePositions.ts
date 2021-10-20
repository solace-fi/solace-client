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
import { ETHERSCAN_API_KEY, ZERO } from '../constants'
import { withBackoffRetries } from '../utils/time'

export const useCachePositions = () => {
  const { library, account } = useWallet()
  const { activeNetwork, networks, findNetworkByChainId } = useNetwork()
  const [storedPosData, setStoredPosData] = useSessionStorage<NetworkCache[]>('sol_position_data', [])
  const running = useRef(false)
  const [dataInitialized, setDataInitialized] = useState<boolean>(false)

  const setStoredData = useCallback(() => {
    // on mount, if stored data exists in session already, return that data, else return newly made data
    if (storedPosData.length == 0) {
      const unsetPositionData = networks.map((network) => {
        const supportedProducts = network.cache.supportedProducts.map((product: SupportedProduct) => product.name)
        const cachedPositions: PositionsCache = {}
        const cachedPositionNames: PositionNamesCache = {}
        supportedProducts.forEach((name: ProductName) => {
          cachedPositions[name] = { positions: [], init: false }
          cachedPositionNames[name] = { positionNames: {}, underlyingPositionNames: {}, init: false }
        })
        return {
          chainId: network.chainId,
          positionsCache: cachedPositions,
          positionNamesCache: cachedPositionNames,
        }
      })
      setStoredPosData(unsetPositionData)
      return unsetPositionData
    }
    return storedPosData
  }, [storedPosData, setStoredPosData])

  const getAllPositionsforChain = useCallback(
    async (data: NetworkCache[], _activeNetwork: NetworkConfig, _library: any, _account: string) => {
      if (running.current || _library == undefined || _activeNetwork.chainId == undefined) return
      setDataInitialized(false)
      running.current = true
      if (!findNetworkByChainId(_activeNetwork.chainId)) {
        running.current = false
        return
      }

      // given the input data, find the dataset from that data appropriate to the current network
      const newCache = data.find((dataset) => dataset.chainId == _activeNetwork.chainId)
      if (!newCache) return
      let changeOccurred = false

      // for every supported product in this network, initialize the positions, if any
      const supportedProducts = _activeNetwork.cache.supportedProducts

      const url = `${
        activeNetwork.explorer.apiUrl
      }/api?module=account&action=tokentx&address=${_account}&startblock=0&endblock=latest&apikey=${String(
        ETHERSCAN_API_KEY
      )}`
      const touchedAddresses = await withBackoffRetries(async () => fetch(url))
        .then((res) => res.json())
        .then((result) => result.result)
        .then((result) => {
          if (result != 'Max rate limit reached') return result
          return []
        })
      await Promise.all(
        supportedProducts.map(async (supportedProduct: SupportedProduct) => {
          if (
            !newCache.positionsCache[supportedProduct.name].init &&
            !newCache.positionNamesCache[supportedProduct.name].init
          ) {
            const { initializedPositions, initializedPositionNames } = await handleInitPositions(
              supportedProduct,
              newCache,
              _library,
              _activeNetwork,
              { user: _account, transferHistory: touchedAddresses }
            )
            newCache.positionsCache[supportedProduct.name] = initializedPositions
            newCache.positionNamesCache[supportedProduct.name] = initializedPositionNames
            changeOccurred = true
          }
        })
      )

      if (!changeOccurred) {
        console.log('useCachePositions: no position init needed')
      } else {
        const editedData = data.filter((data) => data.chainId != newCache.chainId)
        const newData = [...editedData, newCache]
        setStoredPosData(newData)
        console.log('useCachePositions: position init completed')
      }
      setDataInitialized(true)
      running.current = false
    },
    []
  )

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
          const tokens: Token[] = await supportedProduct.getTokens(_library, _activeNetwork, metadata).catch((err) => {
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
            positionAddress: troveManagerContract.address,
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
            positionAddress: stabilityPoolAddr,
            positionName: 'Stability Pool',
            amount: ZERO,
            nativeAmount: ZERO,
            associatedToken: { address: lusdTokenAddr, name: 'LUSD', symbol: 'LUSD' },
          })
        }
        if (lqtyStakingAddr && lqtyTokenAddr) {
          liquityPositions.push({
            positionAddress: lqtyStakingAddr,
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

  useEffect(() => {
    if (!account) {
      console.log('useCachePositions: no account found, no init needed')
      return
    }
    // do not run the functions if web3React is not initialized
    const data = setStoredData()
    getAllPositionsforChain(data, activeNetwork, library, account)
  }, [activeNetwork, account])

  return { dataInitialized, storedPosData }
}
