import { useEffect, useRef, useState } from 'react'
import { Token } from '../constants/types'
import { useWallet } from '../context/WalletManager'
import { policyConfig } from '../utils/config/chainConfig'

export const useGetTokens = (): boolean => {
  const { chainId, library } = useWallet()
  const running = useRef(false)
  const [dataInitialized, setDataInitialized] = useState<boolean>(false)

  useEffect(() => {
    const getAllTokensAndPositionsforChain = async () => {
      if (running.current || library == undefined || chainId == undefined) return
      setDataInitialized(false)
      running.current = true
      if (!policyConfig[String(chainId)]) {
        running.current = false
        return
      }
      const supportedProducts = policyConfig[String(chainId)].supportedProducts
      await Promise.all(
        supportedProducts.map(async (supportedProduct: any) => {
          const productName = supportedProduct.name
          if (
            !policyConfig[String(chainId)].tokens[productName].tokensInitialized &&
            !policyConfig[String(chainId)].positions[productName].positionNamesInitialized
          ) {
            const tokens: Token[] = await policyConfig[String(chainId)].tokens[productName].getTokens(library)
            policyConfig[String(chainId)].tokens[productName] = {
              ...policyConfig[String(chainId)].tokens[productName],
              savedTokens: tokens,
              tokensInitialized: true,
            }
            const positionNames = tokens.reduce(
              (names: any, token: any) => ({ ...names, [token.token.address.toLowerCase()]: token.underlying.symbol }),
              {}
            )
            policyConfig[String(chainId)].positions[productName] = {
              ...policyConfig[String(chainId)].positions[productName],
              positionNames: positionNames,
              positionNamesInitialized: true,
            }
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
