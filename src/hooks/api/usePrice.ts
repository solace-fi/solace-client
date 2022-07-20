import { useEffect, useRef, useState } from 'react'
import { Price as PriceApi, TokenToPriceMapping } from '@solace-fi/sdk-nightly'

export const useGetCrossTokenPricesFromCoingecko = (minute: number): { tokenPriceMapping: TokenToPriceMapping } => {
  const [tokenPriceMapping, setTokenPriceMapping] = useState<TokenToPriceMapping>({})
  const gettingPrices = useRef(false)

  useEffect(() => {
    const getPrices = async () => {
      if (gettingPrices.current) return
      gettingPrices.current = true
      const price = new PriceApi()
      const consolidatedPriceMapping = await price.getMirrorCoingeckoPrices()

      setTokenPriceMapping(consolidatedPriceMapping)
      gettingPrices.current = false
    }
    getPrices()
  }, [minute])

  return { tokenPriceMapping }
}
