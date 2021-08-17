import { useEffect, useRef, useState } from 'react'
import { Token } from '../constants/types'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'

export const useGetTokens = (): boolean => {
  const { library } = useWallet()
  const { activeNetwork, findNetworkByChainId, chainId } = useNetwork()
  const running = useRef(false)
  const [dataInitialized, setDataInitialized] = useState<boolean>(false)

  useEffect(() => {
    const getAllTokensAndPositionsforChain = async () => {
      if (running.current || library == undefined || chainId == undefined) return
      setDataInitialized(false)
      running.current = true
      if (!findNetworkByChainId(chainId)) {
        running.current = false
        return
      }
      const supportedProducts = activeNetwork.cache.supportedProducts
      await Promise.all(
        supportedProducts.map(async (supportedProduct: any) => {
          const productName = supportedProduct.name
          if (
            !activeNetwork.cache.tokens[productName].tokensInitialized &&
            !activeNetwork.cache.positions[productName].positionNamesInitialized
          ) {
            const tokens: Token[] = await activeNetwork.cache.tokens[productName].getTokens(
              library,
              activeNetwork.chainId
            )
            const initializedTokens = {
              ...activeNetwork.cache.tokens[productName],
              savedTokens: tokens,
              tokensInitialized: true,
            }
            activeNetwork.cache.tokens[productName] = initializedTokens
            const positionNames = tokens.reduce(
              (names: any, token: any) => ({ ...names, [token.token.address.toLowerCase()]: token.underlying.symbol }),
              {}
            )
            const initializedPositions = {
              ...activeNetwork.cache.positions[productName],
              positionNames: positionNames,
              positionNamesInitialized: true,
            }
            activeNetwork.cache.positions[productName] = initializedPositions
          }
        })
      )
      setDataInitialized(true)
      running.current = false
    }
    getAllTokensAndPositionsforChain()
  }, [library])

  return dataInitialized
}
