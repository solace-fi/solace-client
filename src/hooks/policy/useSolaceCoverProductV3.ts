import { useEffect, useRef, useState } from 'react'
import { Risk, SolaceRiskSeries } from '@solace-fi/sdk-nightly'

export const useRiskSeries = () => {
  const [series, setSeries] = useState<SolaceRiskSeries | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const fetching = useRef(false)

  useEffect(() => {
    setLoading(true)
  }, [])

  useEffect(() => {
    const getRiskSeries = async () => {
      if (fetching.current) {
        console.log('useRiskSeries: already fetching')
        return
      }
      fetching.current = true
      const risk = new Risk()
      const series: any = await risk.getSolaceRiskSeries()
      if (series.data.protocolMap) {
        setSeries(series as SolaceRiskSeries)
        console.log('useRiskSeries: series fetched successfully')
        setLoading(false)
        fetching.current = false
      } else {
        console.log('useRiskSeries: series not found from risk api')
        setLoading(false)
        fetching.current = false
      }
    }
    getRiskSeries()
  }, [])

  return { series, loading }
}
