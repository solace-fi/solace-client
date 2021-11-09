import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { hotjar } from 'react-hotjar'

export const AnalyticsReporter = (): null => {
  const location = useLocation()

  useEffect(() => {
    hotjar.initialize(2686955, 6)
  }, [])

  useEffect(() => {
    if (typeof window == 'undefined') return
    hotjar.stateChange(location.pathname)
    window.gtag('config', String(process.env.REACT_APP_GOOGLE_ANALYTICS_ID), {
      page_title: location.pathname,
      page_path: location.pathname,
    })
  }, [location])
  return null
}

export const gtagEvent = (ACTION: string, category: string, label: string, value: string): void => {
  window.gtag('event', ACTION, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
