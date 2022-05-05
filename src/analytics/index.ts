import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { hotjar } from 'react-hotjar'

export const AnalyticsReporter = (): null => {
  const location = useLocation()

  useEffect(() => {
    hotjar.initialize(2681883, 6)
  }, [])

  useEffect(() => {
    if (typeof window == 'undefined') return
    hotjar.stateChange(location.pathname)
    window.gtag('config', String('G-F3S8CKE1PE'), {
      page_title: location.pathname,
      page_path: location.pathname,
    })
  }, [location])
  return null
}
