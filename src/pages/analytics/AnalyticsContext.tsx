import { hydrateLibrary } from '@solace-fi/hydrate'
import axios from 'axios'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AnalyticsContextType = {
  nativeUwpHistoryData: any[]
  hydratedVolatilityData: any
  acceptedTickers: string[]
  trials: number
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  nativeUwpHistoryData: [],
  hydratedVolatilityData: undefined,
  acceptedTickers: [],
  trials: 0,
})

const AnalyticsManager: React.FC = ({ children }) => {
  const [data, setData] = useState<any[]>([])
  const [hydratedData, setHydratedData] = useState<any>(undefined)
  const [acceptedTickers, setAcceptedTickers] = useState<string[]>([])
  const trials = useMemo(() => 1000, [])

  useEffect(() => {
    const mountAndHydrate = async () => {
      const res: any = await axios.get(`https://stats-cache.solace.fi/volatility.json`)
      const hydration: any = hydrateLibrary(res.data.data, trials)
      const _acceptedTickers: string[] = []
      Object.keys(hydration).map((key) => {
        _acceptedTickers.push(key)
      })
      setAcceptedTickers(_acceptedTickers)
      setHydratedData(hydration)
    }
    mountAndHydrate()
  }, [trials])

  useEffect(() => {
    const getData = async () => {
      const analytics = await axios.get('https://stats-cache.solace.fi/native_uwp/all.json')
      setData(analytics.data['5']) // todo: 5 is gorli chainid
    }
    getData()
  }, [])

  const value = useMemo(
    () => ({
      nativeUwpHistoryData: data,
      hydratedVolatilityData: hydratedData,
      acceptedTickers,
      trials,
    }),
    [data, hydratedData, acceptedTickers, trials]
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext(): AnalyticsContextType {
  return useContext(AnalyticsContext)
}

export default AnalyticsManager
