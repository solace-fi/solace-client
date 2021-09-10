import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { ThemeProvider } from 'styled-components'
import { lightTheme, darkTheme } from '../styles/themes'
import { Error, SystemNotice } from '../constants/enums'
import { ErrorData, SystemNoticeData } from '../constants/types'

type GeneralContextType = {
  appTheme: 'light' | 'dark'
  selectedTheme: 'light' | 'dark' | undefined
  toggleTheme: () => void
  notices: string[]
  errors: string[]
  addNotices: (noticesToAdd: SystemNoticeData[]) => void
  removeNotices: (noticesToRemove: SystemNotice[]) => void
  addErrors: (errorsToAdd: ErrorData[]) => void
  removeErrors: (errorsToRemove: Error[]) => void
}

const GeneralContext = createContext<GeneralContextType>({
  appTheme: 'light',
  selectedTheme: undefined,
  toggleTheme: () => undefined,
  notices: [],
  errors: [],
  addNotices: () => undefined,
  removeNotices: () => undefined,
  addErrors: () => undefined,
  removeErrors: () => undefined,
})

const mqlDark = window.matchMedia('(prefers-color-scheme: dark)')
const defaultTheme = mqlDark.matches ? 'dark' : 'light'

export function useGeneral(): GeneralContextType {
  return useContext<GeneralContextType>(GeneralContext)
}

const GeneralProvider: React.FC = (props) => {
  const [osColorScheme, setOsColorScheme] = useState<'light' | 'dark'>(defaultTheme)
  const [selectedTheme, setSelectedTheme, removeSelectedTheme] = useLocalStorage<'light' | 'dark' | undefined>(
    'sol_data_theme'
  )
  const [notices, setNotices] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const appTheme: 'light' | 'dark' = selectedTheme || osColorScheme

  const theme = appTheme == 'light' ? lightTheme : darkTheme

  const addNotices = useCallback((noticesToAdd: SystemNoticeData[]) => {
    if (noticesToAdd.length == 0) return

    // convert input data into JSON string array for easy deep comparison
    const stringifiedNoticeData = noticesToAdd.map((notice) => JSON.stringify(notice))

    // remove additions that already exist on cache
    const updatedNotices = stringifiedNoticeData.filter((notice: string) => !notices.includes(notice))
    if (updatedNotices.length == 0) return
    setNotices([...updatedNotices, ...notices])
  }, [])

  const removeNotices = useCallback((noticesToRemove: SystemNotice[]) => {
    if (noticesToRemove.length == 0) return

    // convert cached data into JSON object to compare Error values, then remove those from cache whose values match
    const updatedNotices = notices.filter(
      (notice: string) => !noticesToRemove.includes((JSON.parse(notice) as SystemNoticeData).noticeType)
    )
    if (updatedNotices == notices) return
    setNotices(updatedNotices)
  }, [])

  const addErrors = useCallback((errorsToAdd: ErrorData[]) => {
    if (errorsToAdd.length == 0) return

    // convert input data into JSON string array for easy deep comparison
    const stringifiedErrorData = errorsToAdd.map((error) => JSON.stringify(error))

    // remove additions that already exist on cache
    const updatedErrors = stringifiedErrorData.filter((error) => !errors.includes(error))
    if (updatedErrors.length == 0) return
    setErrors([...updatedErrors, ...errors])
  }, [])

  const removeErrors = useCallback((errorsToRemove: Error[]) => {
    if (errorsToRemove.length == 0) return

    // convert cached data into JSON object to compare Error values, then remove those from cache whose values match
    const updatedErrors = errors.filter(
      (error: string) => !errorsToRemove.includes((JSON.parse(error) as ErrorData).errorType)
    )
    if (updatedErrors == notices) return
    setErrors(updatedErrors)
  }, [])

  useEffect(() => {
    setOsColorScheme(defaultTheme)

    mqlDark.addEventListener('change', (e) => {
      setOsColorScheme(e.matches ? 'dark' : 'light')
    })
  }, [])

  function toggleTheme() {
    if (selectedTheme === 'light') {
      setSelectedTheme('dark')
    } else if (selectedTheme === 'dark') {
      removeSelectedTheme()
    } else {
      setSelectedTheme('light')
    }
  }

  const value: GeneralContextType = {
    appTheme,
    selectedTheme,
    toggleTheme,
    notices,
    errors,
    addNotices,
    removeNotices,
    addErrors,
    removeErrors,
  }

  return (
    <GeneralContext.Provider value={value}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </GeneralContext.Provider>
  )
}

export default GeneralProvider
