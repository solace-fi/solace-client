import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const GoogleAnalyticsReporter = (): null => {
  const location = useLocation()

  useEffect(() => {
    if (typeof window == 'undefined') return
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
