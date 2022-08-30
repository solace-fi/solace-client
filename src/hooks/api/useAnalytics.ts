import axios from 'axios'
import { useEffect, useState } from 'react'

export const useAnalytics = () => {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const getData = async () => {
      const analytics = await axios.get('https://stats-cache.solace.fi/native_uwp/all.json')
      setData(analytics.data['5']) // 5 is gorli chainid
    }
    getData()
  }, [])

  return { data }
}
